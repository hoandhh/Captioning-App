import { Redirect } from 'expo-router';

export default function Home() {
  // Chuyển hướng đến trang tabs/index (home)
  return <Redirect href="/(tabs)" />;
}
