import { ClipboardList } from 'lucide-react';

interface Props {
  message: string;
}

export default function EmptyState({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
      <ClipboardList size={48} className="mb-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
