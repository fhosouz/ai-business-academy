export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  duration_minutes?: number;
  order_index: number;
  is_free: boolean;
  course_id: string;
  category_id: string;
  categories?: {
    id: string;
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  category_id: string;
}