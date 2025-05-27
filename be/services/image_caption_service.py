# services/image_caption_service.py
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import os
from googletrans import Translator
from gtts import gTTS
import tempfile
import playsound
import io
import time
from datetime import datetime
import logging

class ImageCaptionService:
    """
    Lớp này chịu trách nhiệm:
    - Load mô hình BLIP và Processor từ local (một lần duy nhất).
    - Cung cấp hàm generate_caption() nhận file ảnh từ controller, trả về chuỗi caption.
    - Nếu bật speak=True: dịch chú thích sang tiếng Việt và phát âm thanh.
    - Hỗ trợ nhiều mô hình khác nhau: mặc định và du lịch.
    """

    _default_model = None
    _default_processor = None
    _travel_model = None
    _travel_processor = None
    _device = "cuda" if torch.cuda.is_available() else "cpu"

    # Đường dẫn mô hình
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
    _default_model_name = "Salesforce/blip-image-captioning-base"  # Tên mô hình mặc định từ Salesforce
    _default_model_path = os.path.join(parent_dir, "pretrain", "blip_default")  # Đường dẫn lưu mô hình mặc định
    _travel_model_path = os.path.join(parent_dir, "pretrain", "blip_trained")  # Mô hình du lịch hiện tại

    _is_loading_default = False
    _is_loading_travel = False
    _translator = Translator()  # Tái sử dụng translator
    
    # Đường dẫn lưu log
    _log_dir = os.path.join(parent_dir, "logs")
    os.makedirs(_log_dir, exist_ok=True)

    @classmethod
    def _load_default_model_if_needed(cls):
        """Tải mô hình mặc định (Salesforce BLIP) nếu cần"""
        if cls._default_model is None or cls._default_processor is None:
            if cls._is_loading_default:
                import time
                while cls._is_loading_default and (cls._default_model is None or cls._default_processor is None):
                    time.sleep(0.5)
                return

            cls._is_loading_default = True
            try:
                # Kiểm tra xem mô hình đã được lưu vào thư mục local chưa
                if os.path.exists(cls._default_model_path) and os.path.isdir(cls._default_model_path):
                    print(f"Đang tải mô hình mặc định BLIP từ thư mục local: {cls._default_model_path}...")
                    model_path = cls._default_model_path
                else:
                    print(f"Không tìm thấy mô hình mặc định trong thư mục local, đang tải từ Hugging Face: {cls._default_model_name}...")
                    # Đảm bảo thư mục cha tồn tại
                    os.makedirs(os.path.dirname(cls._default_model_path), exist_ok=True)
                    model_path = cls._default_model_name
                
                # Tải processor và model
                cls._default_processor = BlipProcessor.from_pretrained(model_path, use_fast=True)
                cls._default_model = BlipForConditionalGeneration.from_pretrained(model_path)
                
                # Lưu mô hình vào thư mục local nếu đang tải từ Hugging Face
                if model_path == cls._default_model_name:
                    print(f"Đang lưu mô hình mặc định vào thư mục local: {cls._default_model_path}...")
                    cls._default_processor.save_pretrained(cls._default_model_path)
                    cls._default_model.save_pretrained(cls._default_model_path)
                    print(f"Đã lưu mô hình mặc định thành công vào: {cls._default_model_path}")
                
                # Chuyển mô hình sang thiết bị phù hợp
                cls._default_model = cls._default_model.to(cls._device)
                cls._default_model.eval()
                print(f"Tải mô hình mặc định thành công trên thiết bị {cls._device}")
            except Exception as e:
                print(f"Lỗi khi tải mô hình mặc định: {e}")
                # Nếu có lỗi khi tải từ local, thử tải trực tiếp từ Hugging Face
                if os.path.exists(cls._default_model_path):
                    print(f"Thử tải lại từ Hugging Face: {cls._default_model_name}...")
                    try:
                        cls._default_processor = BlipProcessor.from_pretrained(cls._default_model_name, use_fast=True)
                        cls._default_model = BlipForConditionalGeneration.from_pretrained(cls._default_model_name)
                        cls._default_model = cls._default_model.to(cls._device)
                        cls._default_model.eval()
                        print(f"Tải mô hình mặc định từ Hugging Face thành công")
                    except Exception as inner_e:
                        print(f"Lỗi khi tải mô hình từ Hugging Face: {inner_e}")
            finally:
                cls._is_loading_default = False

    @classmethod
    def _load_travel_model_if_needed(cls):
        """Tải mô hình du lịch (đã được huấn luyện) nếu cần"""
        if cls._travel_model is None or cls._travel_processor is None:
            if cls._is_loading_travel:
                import time
                while cls._is_loading_travel and (cls._travel_model is None or cls._travel_processor is None):
                    time.sleep(0.5)
                return

            cls._is_loading_travel = True
            try:
                if not os.path.exists(cls._travel_model_path):
                    raise FileNotFoundError(f"Không tìm thấy đường dẫn mô hình du lịch: {cls._travel_model_path}")

                print(f"Đang tải mô hình du lịch BLIP từ {cls._travel_model_path}...")
                cls._travel_processor = BlipProcessor.from_pretrained(cls._travel_model_path, use_fast=True)
                cls._travel_model = BlipForConditionalGeneration.from_pretrained(cls._travel_model_path)
                cls._travel_model = cls._travel_model.to(cls._device)
                cls._travel_model.eval()
                print(f"Tải mô hình du lịch thành công trên thiết bị {cls._device}")
            finally:
                cls._is_loading_travel = False

    @classmethod
    def unload_models(cls):
        """Giải phóng tất cả các mô hình khỏi bộ nhớ"""
        if cls._default_model is not None:
            cls._default_model = None
            cls._default_processor = None

        if cls._travel_model is not None:
            cls._travel_model = None
            cls._travel_processor = None

        import gc
        gc.collect()
        if cls._device == "cuda":
            torch.cuda.empty_cache()
        print("Đã giải phóng tất cả mô hình khỏi bộ nhớ")

    @classmethod
    def speak_caption(cls, text, lang="vi"):
        """
        Phát âm văn bản với ngôn ngữ được chỉ định.
        Phát âm trực tiếp theo ngôn ngữ đã chọn (tiếng Anh hoặc tiếng Việt).
        
        Tham số:
            text: Văn bản cần phát âm
            lang: Ngôn ngữ của văn bản ('en' hoặc 'vi')
        """
        try:
            # Sử dụng đúng ngôn ngữ của văn bản để phát âm
            speech_lang = "en" if lang == "en" else "vi"
            print(f" Phát âm bằng tiếng {speech_lang.upper()}")
            
            tts = gTTS(text, lang=speech_lang)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
                temp_path = fp.name
                tts.save(temp_path)

            try:
                playsound.playsound(temp_path)
            except Exception:
                os.system(f"start {temp_path}")
            finally:
                os.remove(temp_path)
        except Exception as e:
            print(f" Lỗi khi đọc caption: {e}")
            
    @classmethod
    def translate_text(cls, text, src_lang="en", dest_lang="vi"):
        """
        Dịch văn bản từ ngôn ngữ nguồn sang ngôn ngữ đích.
        
        Tham số:
            text: Văn bản cần dịch
            src_lang: Ngôn ngữ nguồn ('en' hoặc 'vi')
            dest_lang: Ngôn ngữ đích ('en' hoặc 'vi')
        """
        try:
            if src_lang == dest_lang:
                return text
                
            translation = cls._translator.translate(text, src=src_lang, dest=dest_lang)
            return translation.text
        except Exception as e:
            print(f"Lỗi khi dịch văn bản: {e}")
            return text

    @classmethod
    def log_to_file(cls, log_message, filename=None):
        """
        Ghi log vào file txt
        
        Tham số:
            log_message: Nội dung log cần ghi
            filename: Tên file log (mặc định là ngày hiện tại)
        """
        try:
            if filename is None:
                # Sử dụng ngày hiện tại làm tên file mặc định
                filename = f"caption_log_{datetime.now().strftime('%Y-%m-%d')}.txt"
            
            log_path = os.path.join(cls._log_dir, filename)
            
            # Ghi log vào file
            with open(log_path, "a", encoding="utf-8") as log_file:
                log_file.write(f"{log_message}\n\n")
                
            return True
        except Exception as e:
            print(f"Lỗi khi ghi log vào file: {e}")
            return False
    
    @classmethod
    def generate_caption_from_binary(cls, image_data, max_length=30, num_beams=5, speak=False, model_type="default", language="en"):
        start_time = time.time()
        log_messages = []
        caption_en = None
        caption_vi = None
        try:
            if model_type == "travel":
                cls._load_travel_model_if_needed()
                model = cls._travel_model
                processor = cls._travel_processor
            else:
                cls._load_default_model_if_needed()
                model = cls._default_model
                processor = cls._default_processor
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            inputs = processor(image, return_tensors="pt")
            for k, v in inputs.items():
                inputs[k] = v.to(cls._device)
            with torch.no_grad():
                output_ids = model.generate(
                    **inputs,
                    max_length=max_length,
                    num_beams=num_beams,
                    min_length=5
                )
            caption_en = processor.decode(output_ids[0], skip_special_tokens=True)
            log_messages.append(f"Caption tiếng Anh: {caption_en}")
            if language == "vi":
                caption_vi = cls.translate_text(caption_en, src_lang="en", dest_lang="vi")
                log_messages.append(f"Caption tiếng Việt: {caption_vi}")
                caption = caption_vi
            else:
                caption = caption_en
            total_time = time.time() - start_time
            log_messages.insert(0, f"Tạo mô tả: {total_time:.2f}s")
            cls.log_to_file("\n".join(log_messages))
            return caption
        except Exception as e:
            error_message = f"Lỗi khi tạo caption: {e}"
            log_messages.append(error_message)
            cls.log_to_file("\n".join(log_messages))
            raise

    @classmethod
    def generate_caption_from_image_id(cls, image_id, max_length=30, num_beams=5, speak=False, model_type="default", language="en"):
        """
        Tạo caption cho ảnh từ ID của ảnh trong MongoDB.

        Tham số:
            model_type: Loại mô hình để sử dụng ("default" hoặc "travel")
            language: Ngôn ngữ mô tả ("en" hoặc "vi")
        """
        from models.image import Image

        image_doc = Image.objects(id=image_id).first()
        if not image_doc:
            raise ValueError("Không tìm thấy ảnh với ID cung cấp")

        return cls.generate_caption_from_binary(image_doc.image_data, max_length, num_beams, speak, model_type, language)