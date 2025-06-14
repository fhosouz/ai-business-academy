export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  video_duration?: number;
  order_index: number;
  is_free: boolean;
  course_id: number;
  category_id: number;
  categories?: {
    id: number;
    name: string;
  };
}

export interface Category {
  id: number;
  name: string;
  description: string;
}