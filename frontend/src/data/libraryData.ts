export interface Library {
  id: number;
  title: string;
  author: string;
  description: string;
  progress: number;
  cardCount: number;
  studiedCards: number;
  level: string;
  rating: number;
  reviewCount: number;
  category: string;
  lastAccessed: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdDate: string;
  studyTime: string;
  streak: number;
  accuracy: number;
}

export interface Card {
  id: number;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReview: string;
  nextReview: string;
  status: 'mastered' | 'learning' | 'difficult';
}

export const librariesData: Library[] = [
  {
    id: 1,
    title: "Từ vựng Tiếng Anh TOEIC",
    author: "Tôi",
    description: "Bộ flashcard từ vựng TOEIC hoàn chỉnh với 150 từ quan trọng nhất, được phân loại theo chủ đề và độ khó. Bao gồm phiên âm, ví dụ và bài tập thực hành.",
    progress: 75,
    cardCount: 150,
    studiedCards: 112,
    level: "Trung cấp",
    rating: 4.8,
    reviewCount: 24,
    category: "Đang học",
    lastAccessed: "2 giờ trước",
    subject: "Tiếng Anh",
    difficulty: "medium",
    tags: ["TOEIC", "Business English", "Vocabulary"],
    createdDate: "15/08/2024",
    studyTime: "24 giờ",
    streak: 7,
    accuracy: 85
  },
  {
    id: 2,
    title: "Công thức Toán học cơ bản",
    author: "Thầy Minh",
    description: "Tổng hợp các công thức toán học từ cấp 1 đến cấp 3, bao gồm đại số, hình học và lượng giác. Được tổ chức theo từng chương và có ví dụ minh họa.",
    progress: 45,
    cardCount: 80,
    studiedCards: 36,
    level: "Cơ bản",
    rating: 4.5,
    reviewCount: 18,
    category: "Đang học",
    lastAccessed: "1 ngày trước",
    subject: "Toán học",
    difficulty: "easy",
    tags: ["Công thức", "Toán học", "Cơ bản"],
    createdDate: "20/07/2024",
    studyTime: "12 giờ",
    streak: 3,
    accuracy: 78
  },
  {
    id: 3,
    title: "Lịch sử Việt Nam",
    author: "Cô Lan",
    description: "Tìm hiểu lịch sử Việt Nam từ thời cổ đại đến hiện đại. Bao gồm các sự kiện quan trọng, nhân vật lịch sử và mốc thời gian đáng nhớ.",
    progress: 90,
    cardCount: 200,
    studiedCards: 180,
    level: "Nâng cao",
    rating: 4.9,
    reviewCount: 42,
    category: "Hoàn thành",
    lastAccessed: "3 giờ trước",
    subject: "Lịch sử",
    difficulty: "hard",
    tags: ["Lịch sử", "Việt Nam", "Sự kiện"],
    createdDate: "10/06/2024",
    studyTime: "35 giờ",
    streak: 15,
    accuracy: 92
  },
  {
    id: 4,
    title: "Từ vựng Tiếng Nhật N5",
    author: "Tôi",
    description: "Học từ vựng tiếng Nhật cơ bản cho kỳ thi N5. Bao gồm hiragana, katakana, kanji cơ bản và các từ vựng thường dùng hàng ngày.",
    progress: 30,
    cardCount: 300,
    studiedCards: 90,
    level: "Cơ bản",
    rating: 4.3,
    reviewCount: 15,
    category: "Đang học",
    lastAccessed: "5 giờ trước",
    subject: "Tiếng Nhật",
    difficulty: "medium",
    tags: ["JLPT", "N5", "Hiragana", "Katakana"],
    createdDate: "01/09/2024",
    studyTime: "8 giờ",
    streak: 5,
    accuracy: 72
  },
  {
    id: 5,
    title: "Hóa học đại cương",
    author: "Thầy Tuấn",
    description: "Khái niệm cơ bản về hóa học, bảng tuần hoàn, liên kết hóa học và các phản ứng hóa học quan trọng. Phù hợp cho học sinh THPT và sinh viên năm nhất.",
    progress: 60,
    cardCount: 120,
    studiedCards: 72,
    level: "Trung cấp",
    rating: 4.6,
    reviewCount: 28,
    category: "Đang học",
    lastAccessed: "1 giờ trước",
    subject: "Hóa học",
    difficulty: "hard",
    tags: ["Hóa học", "Đại cương", "Phản ứng"],
    createdDate: "25/08/2024",
    studyTime: "18 giờ",
    streak: 10,
    accuracy: 80
  }
];

export const cardsData: { [libraryId: number]: Card[] } = {
  1: [
    {
      id: 1,
      front: "Accomplish",
      back: "Hoàn thành, đạt được",
      difficulty: "easy",
      lastReview: "2 giờ trước",
      nextReview: "1 ngày nữa",
      status: "mastered"
    },
    {
      id: 2,
      front: "Negotiate",
      back: "Đàm phán, thương lượng",
      difficulty: "medium",
      lastReview: "1 ngày trước",
      nextReview: "3 ngày nữa",
      status: "learning"
    },
    {
      id: 3,
      front: "Infrastructure",
      back: "Cơ sở hạ tầng",
      difficulty: "hard",
      lastReview: "3 ngày trước",
      nextReview: "Hôm nay",
      status: "difficult"
    },
    {
      id: 4,
      front: "Revenue",
      back: "Doanh thu",
      difficulty: "medium",
      lastReview: "5 giờ trước",
      nextReview: "2 ngày nữa",
      status: "mastered"
    }
  ],
  2: [
    {
      id: 1,
      front: "Định lý Pythagoras",
      back: "a² + b² = c² (với c là cạnh huyền)",
      difficulty: "medium",
      lastReview: "1 ngày trước",
      nextReview: "2 ngày nữa",
      status: "learning"
    },
    {
      id: 2,
      front: "Công thức tính diện tích hình tròn",
      back: "S = πr² (với r là bán kính)",
      difficulty: "easy",
      lastReview: "3 giờ trước",
      nextReview: "1 ngày nữa",
      status: "mastered"
    },
    {
      id: 3,
      front: "Công thức nghiệm phương trình bậc 2",
      back: "x = (-b ± √(b²-4ac)) / 2a",
      difficulty: "hard",
      lastReview: "2 ngày trước",
      nextReview: "Hôm nay",
      status: "difficult"
    }
  ],
  3: [
    {
      id: 1,
      front: "Khởi nghĩa Hai Bà Trưng",
      back: "Năm 40 - 43, chống đô hộ Trung Quốc lần thứ nhất",
      difficulty: "medium",
      lastReview: "1 giờ trước",
      nextReview: "3 ngày nữa",
      status: "mastered"
    },
    {
      id: 2,
      front: "Thành lập Đảng Cộng sản Việt Nam",
      back: "3/2/1930 tại Hồng Kông do Nguyễn Ái Quốc thành lập",
      difficulty: "easy",
      lastReview: "2 giờ trước",
      nextReview: "1 ngày nữa",
      status: "mastered"
    },
    {
      id: 3,
      front: "Cách mạng tháng Tám",
      back: "Tháng 8/1945, giành chính quyền toàn quốc",
      difficulty: "medium",
      lastReview: "30 phút trước",
      nextReview: "2 ngày nữa",
      status: "learning"
    }
  ],
  4: [
    {
      id: 1,
      front: "こんにちは",
      back: "Konnichiwa - Xin chào (ban ngày)",
      difficulty: "easy",
      lastReview: "1 giờ trước",
      nextReview: "1 ngày nữa",
      status: "mastered"
    },
    {
      id: 2,
      front: "ありがとう",
      back: "Arigatou - Cảm ơn",
      difficulty: "easy",
      lastReview: "2 giờ trước",
      nextReview: "1 ngày nữa",
      status: "mastered"
    },
    {
      id: 3,
      front: "すみません",
      back: "Sumimasen - Xin lỗi / Excuse me",
      difficulty: "medium",
      lastReview: "3 giờ trước",
      nextReview: "2 ngày nữa",
      status: "learning"
    }
  ],
  5: [
    {
      id: 1,
      front: "Nguyên tử",
      back: "Đơn vị cơ bản nhỏ nhất của vật chất",
      difficulty: "easy",
      lastReview: "45 phút trước",
      nextReview: "1 ngày nữa",
      status: "mastered"
    },
    {
      id: 2,
      front: "Phân tử",
      back: "Nhóm nguyên tử liên kết với nhau tạo thành hợp chất",
      difficulty: "medium",
      lastReview: "2 giờ trước",
      nextReview: "2 ngày nữa",
      status: "learning"
    },
    {
      id: 3,
      front: "Ion",
      back: "Nguyên tử hoặc nhóm nguyên tử mang điện tích",
      difficulty: "hard",
      lastReview: "1 ngày trước",
      nextReview: "Hôm nay",
      status: "difficult"
    }
  ]
};

export function getLibraryById(id: number): Library | undefined {
  return librariesData.find(library => library.id === id);
}

export function getCardsByLibraryId(libraryId: number): Card[] {
  return cardsData[libraryId] || [];
}
