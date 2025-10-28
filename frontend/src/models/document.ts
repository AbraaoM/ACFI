import { DocumentCategory } from "../enums/document_category_enum";

export interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  content: string | null;
  status: string;
  category: DocumentCategory;
  chunks_count: number;
  created_at: Date;
  processed_at: Date | null;
}