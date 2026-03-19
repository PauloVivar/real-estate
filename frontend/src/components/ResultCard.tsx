"use client";

import CopyButton from "./CopyButton";

interface ResultCardProps {
  title: string;
  content: string;
}

export default function ResultCard({ title, content }: ResultCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <CopyButton text={content} />
      </div>
      <div className="p-6">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}
