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

class ImageCaptionService:
    """
    Lớp này chịu trách nhiệm:
    - Load mô hình BLIP và Processor từ local (một lần duy nhất).
    - Cung cấp hàm generate_caption() nhận file ảnh từ controller, trả về chuỗi caption.
    - Nếu bật speak=True: dịch chú thích sang tiếng Việt và phát âm thanh.
    """

    _model = None
    _processor = None
    _device = "cuda" if torch.cuda.is_available() else "cpu"

    # Đường dẫn mô hình
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
    _model_path = os.path.join(parent_dir, "pretrain", "blip_trained")

    _is_loading = False
    _translator = Translator()  # Tái sử dụng translator

    @classmethod
    def _load_model_if_needed(cls):
        if cls._model is None or cls._processor is None:
            if cls._is_loading:
                import time
                while cls._is_loading and (cls._model is None or cls._processor is None):
                    time.sleep(0.5)
                return

            cls._is_loading = True
            try:
                if not os.path.exists(cls._model_path):
                    raise FileNotFoundError(f"Không tìm thấy đường dẫn mô hình: {cls._model_path}")

                print(f"Đang tải mô hình BLIP từ {cls._model_path}...")
                cls._processor = BlipProcessor.from_pretrained(cls._model_path, use_fast=True)
                cls._model = BlipForConditionalGeneration.from_pretrained(cls._model_path)
                cls._model = cls._model.to(cls._device)
                cls._model.eval()
                print(f"Tải mô hình thành công trên thiết bị {cls._device}")
            finally:
                cls._is_loading = False

    @classmethod
    def unload_model(cls):
        if cls._model is not None:
            cls._model = None
            cls._processor = None
            import gc
            gc.collect()
            if cls._device == "cuda":
                torch.cuda.empty_cache()
            print("Đã giải phóng mô hình khỏi bộ nhớ")

    @classmethod
    def speak_caption(cls, text_en):
        """
        Dịch văn bản tiếng Anh sang tiếng Việt và phát âm.
        """
        try:
            translation = cls._translator.translate(text_en, src='en', dest='vi')
            caption_vi = translation.text
            print("🔁 Dịch sang tiếng Việt:", caption_vi)

            tts = gTTS(caption_vi, lang='vi')
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
            print(f"⚠️ Lỗi khi đọc caption: {e}")

    @classmethod
    def generate_caption_from_binary(cls, image_data, max_length=30, num_beams=5, speak=False):
        """
        Tạo caption cho ảnh từ dữ liệu nhị phân.
        Nếu speak=True, sẽ dịch caption sang tiếng Việt và phát tiếng.
        """
        try:
            cls._load_model_if_needed()

            # Chuyển dữ liệu nhị phân thành đối tượng PIL Image
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            inputs = cls._processor(image, return_tensors="pt")
            for k, v in inputs.items():
                inputs[k] = v.to(cls._device)

            with torch.no_grad():
                output_ids = cls._model.generate(
                    **inputs,
                    max_length=max_length,
                    num_beams=num_beams,
                    min_length=5
                )

            caption_en = cls._processor.decode(output_ids[0], skip_special_tokens=True)
            print("📸 Caption tiếng Anh:", caption_en)

            if speak:
                cls.speak_caption(caption_en)

            return caption_en

        except Exception as e:
            print(f"Lỗi khi tạo caption: {e}")
            raise
            
    @classmethod
    def generate_caption_from_image_id(cls, image_id, max_length=30, num_beams=5, speak=False):
        """
        Tạo caption cho ảnh từ ID của ảnh trong MongoDB.
        """
        from models.image import Image
        
        image_doc = Image.objects(id=image_id).first()
        if not image_doc:
            raise ValueError("Không tìm thấy ảnh với ID cung cấp")
            
        return cls.generate_caption_from_binary(image_doc.image_data, max_length, num_beams, speak)