import Link from 'next/link';
import { Icons } from './icons';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">FlashLearn</span>
        </Link>
      </div>
    </header>
  );
}
