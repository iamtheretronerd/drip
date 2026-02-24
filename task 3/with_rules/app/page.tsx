import { redirect } from 'next/navigation';

export default function Home() {
    // Simple redirect to dashboard (middleware will bounce to login if unauthorized)
    redirect('/dashboard');
}
