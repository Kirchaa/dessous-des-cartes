'use client';

import { Student } from '../_lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PackSelectorProps {
  students: Student[];
  selectedStudentId: string | null;
  onStudentChange: (studentId: string | null) => void;
}

export default function PackSelector({
  students,
  selectedStudentId,
  onStudentChange,
}: PackSelectorProps) {
  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Sélectionner un élève
      </label>
      <Select
        value={selectedStudentId || 'none'}
        onValueChange={(value) => onStudentChange(value === 'none' ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choisir un élève..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Aucune sélection</SelectItem>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              {student.name} (Pack {student.pack_number})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
