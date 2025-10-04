import { useMemo, useState } from "react";
import {
  Sparkles,
  Play,
  ShieldCheck,
  Target,
  BrainCircuit,
  NotebookPen,
  Trophy,
  Quote,
  Users2,
  CalendarCheck,
  MonitorSmartphone,
  Smartphone,
  Apple
} from "lucide-react";
import { AuthHero, AuthTabs, LoginForm, RegisterForm } from "@/features/auth/components";
import { useAuthView } from "@/features/auth/hooks/useAuthView";
import type { AuthTabId } from "@/features/auth/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { SmartImage } from "@/shared/components/ui/smart-image";
import { Avatar } from "@/shared/components/ui/avatar";

export default function AuthPage() {
  const view = useAuthView();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const journeySteps = useMemo(
    () => [
      {
        title: "Thiết lập mục tiêu cá nhân",
        description: "Chọn kỳ thi, kỹ năng và thời gian học phù hợp với lịch trình hiện tại của bạn.",
        icon: Target,
        highlight: "Chỉ mất 2 phút"
      },
      {
        title: "AI phân tích & đề xuất lộ trình",
        description: "SmartLearn AI quan sát lịch sử học tập để tự động tạo lộ trình tinh gọn nhất.",
        icon: BrainCircuit,
        highlight: "Tinh chỉnh realtime"
      },
      {
        title: "Luyện tập chủ động mỗi ngày",
        description: "Bài học, trò chơi và thử thách được cá nhân hóa theo phong cách học của bạn.",
        icon: NotebookPen,
        highlight: "Tương tác đa nền tảng"
      },
      {
        title: "Theo dõi tiến độ & nhận thưởng",
        description: "Dashboard trực quan, nhắc nhở thông minh và phần thưởng khích lệ mỗi cột mốc.",
        icon: Trophy,
        highlight: "Hiển thị realtime"
      }
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Nguyễn Minh An",
        role: "Sinh viên Bách Khoa",
        quote:
          "SmartLearn giúp mình kiểm soát lịch học và luyện đề rất đều đặn. Sau 8 tuần, mình tăng 180 điểm TOEIC và vẫn còn động lực học tiếp.",
        achievement: "TOEIC 900 sau 8 tuần"
      },
      {
        name: "Trần Khánh Vy",
        role: "Content Creator",
        quote:
          "Mình thích nhất tab trò chơi và flashcard. Mỗi ngày chỉ cần 25 phút nhưng lượng kiến thức được củng cố rất chắc.",
        achievement: "Duy trì streak 64 ngày"
      },
      {
        name: "Lê Hải Đăng",
        role: "Product Manager",
        quote:
          "Dashboard của SmartLearn cực kỳ trực quan. Đội ngũ của mình dùng chung để cập nhật tiến độ và chia sẻ mẹo học hiệu quả.",
        achievement: "Đội nhóm đạt 92% mục tiêu"
      }
    ],
    []
  );

  const communityHighlights = useMemo(
    () => [
      {
        label: "Học viên chủ động mỗi ngày",
        value: "58K+",
        icon: Users2
      },
      {
        label: "Lịch học hoàn thành đúng hạn",
        value: "92%",
        icon: CalendarCheck
      },
      {
        label: "Đánh giá 5 sao trên SmartLearn",
        value: "4.9/5",
        icon: ShieldCheck
      }
    ],
    []
  );

  const platformExperiences = useMemo(
    () => [
      {
        id: "web",
        title: "Web App",
        description: "Truy cập đầy đủ dashboard, báo cáo tiến độ realtime và luyện tập AI ngay trên trình duyệt.",
        icon: MonitorSmartphone,
        badge: "Trải nghiệm đầy đủ",
        gradient: "from-primary/20 via-indigo-500/10 to-sky-300/15",
        highlights: ["AI Mentor 24/7", "Đồng bộ dữ liệu tức thời"],
        ctaLabel: "Khởi chạy ngay",
        ctaTab: "register" as AuthTabId
      },
      {
        id: "android",
        title: "Ứng dụng Android",
        description: "Nhận nhắc nhở thông minh, học bằng flashcard và mini game mọi lúc kể cả offline.",
        icon: Smartphone,
        badge: "Beta mở rộng",
        gradient: "from-emerald-500/20 via-primary/10 to-sky-400/15",
        highlights: ["Widget lịch học", "Thông báo nhắc lịch theo thời gian rảnh"],
        ctaLabel: "Nhận link tải APK",
        ctaTab: "register" as AuthTabId
      },
      {
        id: "ios",
        title: "Ứng dụng iOS",
        description: "Tận dụng Live Activities, đồng bộ iCloud và học xen kẽ trên iPad, iPhone liền mạch.",
        icon: Apple,
        badge: "Ra mắt Q4 2025",
        gradient: "from-fuchsia-500/20 via-primary/10 to-sky-400/20",
        highlights: ["Live Activities", "Đồng bộ đa thiết bị"],
        ctaLabel: "Đăng ký trải nghiệm sớm",
        ctaTab: "register" as AuthTabId
      }
    ],
    []
  );

  const openAuthDialog = (tab: AuthTabId = "login") => {
    view.setActiveTab(tab);
    setDialogOpen(true);
  };

  const currentYear = new Date().getFullYear();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <div className="relative isolate min-h-dvh overflow-hidden bg-gradient-to-br from-[#e3e8ff] via-[#f0e6ff] to-[#d7e3ff] text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(93,148,255,0.32),_transparent_62%)]" />
          <AuthHero model={view.hero} variant="background" className="absolute inset-0 opacity-45" />
          <div className="absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute bottom-16 right-24 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-dvh flex-col">
          <header className="sticky top-0 z-20 border-b border-white/40 bg-gradient-to-r from-[#eaefff]/95 via-[#ece4ff]/95 to-[#e2dbff]/95">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-8 px-6 py-5">
              <a href="#hero" className="flex items-center gap-3 text-primary">
                <SmartImage
                  src={view.hero.brand.logoSrc}
                  alt={view.hero.brand.logoAlt}
                  className="h-11 w-11 rounded-2xl bg-primary/10 p-2 shadow-inner shadow-primary/25"
                  imageClassName="object-contain"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">{view.hero.eyebrow}</p>
                  <span className="text-lg font-semibold text-slate-900">{view.hero.brand.name}</span>
                </div>
              </a>

              <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
                <a href="#features" className="whitespace-nowrap transition-colors hover:text-slate-900">Tính năng nổi bật</a>
                <a href="#journey" className="whitespace-nowrap transition-colors hover:text-slate-900">Lộ trình thông minh</a>
                <a href="#community" className="whitespace-nowrap transition-colors hover:text-slate-900">Cộng đồng</a>
                <a href="#cta" className="whitespace-nowrap transition-colors hover:text-slate-900">Bắt đầu</a>
              </nav>

              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-slate-700" onClick={() => openAuthDialog("login")}>Đăng nhập</Button>
                <Button size="lg" onClick={() => openAuthDialog("register")}>
                  <Sparkles className="h-4 w-4" />
                  Trải nghiệm miễn phí
                </Button>
              </div>
            </div>
          </header>

          <main id="hero" className="mx-auto w-full max-w-7xl flex-1 px-6 pb-24 pt-16 sm:pt-20">
            <section className="relative overflow-hidden rounded-[36px] border border-white/50 bg-white/25 px-6 py-12 shadow-[0_35px_120px_-60px_rgba(14,23,42,0.45)] backdrop-blur-2xl sm:px-12 sm:py-16">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/5 to-sky-100/30" />
              <div className="relative z-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div className="space-y-7">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-primary/80">
                    <Badge variant="secondary" className="border-primary/30 bg-primary/15 text-primary">
                      {view.hero.eyebrow}
                    </Badge>
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-primary/70">
                      <Sparkles className="h-3.5 w-3.5" />
                      {view.hero.brand.tagline}
                    </span>
                  </div>

                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-transparent bg-gradient-to-r from-slate-900 via-primary to-sky-500 bg-clip-text sm:text-5xl">
                    {view.hero.headline}
                  </h1>
                  <p className="text-lg leading-relaxed text-slate-600 sm:text-xl">{view.hero.subheadline}</p>
                  <p className="text-base leading-relaxed text-slate-500">{view.hero.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-4">
                    <Button size="lg" onClick={() => openAuthDialog("register")}>
                      Tham gia ngay
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => openAuthDialog("login")}>
                      Đăng nhập nhanh
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-primary hover:text-primary"
                      onClick={() => openAuthDialog("register")}
                    >
                      <Play className="h-4 w-4" />
                      Xem demo 2 phút
                    </Button>
                  </div>

                  <div className="grid gap-4 pt-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-white/25 px-4 py-3 backdrop-blur-xl">
                      <ShieldCheck className="h-10 w-10 rounded-xl bg-primary/10 p-2 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Bảo mật cấp độ doanh nghiệp</p>
                        <p className="text-xs text-slate-500">Mã hóa dữ liệu toàn phần và lưu trữ an toàn tại Việt Nam.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-white/25 px-4 py-3 backdrop-blur-xl">
                      <CalendarCheck className="h-10 w-10 rounded-xl bg-sky-100 p-2 text-sky-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Nhắc nhở linh hoạt</p>
                        <p className="text-xs text-slate-500">Điều chỉnh theo nhịp sinh hoạt, không bỏ lỡ buổi ôn tập nào.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 -m-10 rounded-[40px] bg-gradient-to-br from-primary/25 via-white/25 to-sky-200/35 blur-3xl" />
                  <div className="relative rounded-[32px] border border-white/25 bg-gradient-to-br from-primary/25 via-transparent to-sky-300/20 p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.5)] backdrop-blur-xl">
                    {view.hero.illustration.badge && (
                      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        {view.hero.illustration.badge}
                      </span>
                    )}
                    <SmartImage
                      src={view.hero.illustration.src}
                      alt={view.hero.illustration.alt}
                      className="block w-full"
                      imageClassName="aspect-[4/5] object-contain"
                      rounded="rounded-[26px]"
                      loading="lazy"
                    />
                    {view.hero.illustration.caption && (
                      <p className="mt-4 text-sm text-slate-500">{view.hero.illustration.caption}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-12 grid gap-4 sm:grid-cols-3">
                {view.hero.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-white/80 bg-white/70 px-6 py-5 shadow-[0_24px_65px_-55px_rgba(14,23,42,0.7)]"
                  >
                    <p className="text-3xl font-semibold text-transparent bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="platforms" className="mt-24 rounded-[36px] border border-white/50 bg-white/20 p-8 shadow-[0_32px_100px_-60px_rgba(14,23,42,0.5)] backdrop-blur-2xl sm:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">ĐA NỀN TẢNG</p>
                <h2 className="mt-3 text-3xl font-semibold text-transparent bg-gradient-to-r from-slate-900 via-primary to-sky-500 bg-clip-text sm:text-4xl">
                  Học liền mạch trên web, Android và iOS
                </h2>
                <p className="mt-3 text-base text-slate-500">
                  SmartLearn đồng bộ tiến độ trong thời gian thực. Bạn có thể bắt đầu trên máy tính, tiếp tục trên điện thoại và hoàn thành thử thách trên iPad mà không bỏ lỡ dữ liệu nào.
                </p>
              </div>

              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {platformExperiences.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.id}
                      className="relative overflow-hidden rounded-[30px] border border-white/50 bg-white/25 p-6 shadow-[0_28px_80px_-60px_rgba(14,23,42,0.55)] backdrop-blur-xl"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-70`} />
                      <div className="relative z-10 flex h-full flex-col gap-5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/30 px-3 py-1 text-xs font-semibold text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            {platform.badge}
                          </span>
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/40 text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-slate-900">{platform.title}</h3>
                          <p className="text-sm text-slate-600">{platform.description}</p>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600/90">
                          {platform.highlights.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/50 text-primary">
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="outline"
                          className="mt-auto w-full border-white/60 bg-white/40 text-primary hover:text-primary"
                          onClick={() => openAuthDialog(platform.ctaTab)}
                        >
                          {platform.ctaLabel}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="features" className="mt-24">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">TÍNH NĂNG NỔI BẬT</p>
                  <h2 className="mt-3 text-3xl font-semibold text-transparent bg-gradient-to-r from-slate-900 via-primary to-sky-500 bg-clip-text sm:text-4xl">
                    Mọi trải nghiệm đều xoay quanh bạn
                  </h2>
                  <p className="mt-3 max-w-2xl text-base text-slate-500">
                    SmartLearn kết hợp công nghệ AI và thiết kế trò chơi để giữ động lực học lâu dài, đồng thời cung cấp dữ liệu realtime cho bạn và đội ngũ mentor.
                  </p>
                </div>
                <Button variant="ghost" className="self-start" onClick={() => openAuthDialog("register")}>Khám phá lộ trình</Button>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {view.hero.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_75px_-60px_rgba(15,23,42,0.6)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-sky-100/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative z-10 space-y-3">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                        <p className="text-sm text-slate-500">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="journey" className="mt-24 rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_35px_120px_-70px_rgba(15,23,42,0.6)] sm:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">LỘ TRÌNH THÔNG MINH</p>
                <h2 className="mt-3 text-3xl font-semibold text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-sky-500 bg-clip-text sm:text-4xl">
                  Từng bước dẫn dắt bởi AI Mentor
                </h2>
                <p className="mt-3 text-base text-slate-500">
                  Đội ngũ mentor ảo và công cụ học tương tác đảm bảo bạn luôn biết phải làm gì tiếp theo, luôn được khích lệ và đo lường tiến bộ rõ ràng.
                </p>
              </div>

              <div className="mt-12 grid gap-8 md:grid-cols-2">
                {journeySteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.title}
                      className="relative rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_26px_70px_-60px_rgba(14,23,42,0.6)]"
                    >
                      <div className="absolute -left-10 top-6 hidden h-20 w-20 rounded-full bg-primary/10 blur-3xl md:block" />
                      <div className="relative flex items-start gap-4">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
                            Bước {index + 1}
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] text-primary">{step.highlight}</span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                          <p className="text-sm text-slate-500">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="community" className="mt-24">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_90px_-60px_rgba(14,23,42,0.6)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">CỘNG ĐỒNG NĂNG ĐỘNG</p>
                  <h2 className="mt-3 text-3xl font-semibold text-transparent bg-gradient-to-r from-slate-900 via-primary to-sky-500 bg-clip-text sm:text-4xl">
                    Cùng nhau tiến bộ mỗi ngày
                  </h2>
                  <p className="mt-3 text-base text-slate-500">
                    Hơn 58.000 học viên đang tham gia các thử thách học tập, chia sẻ flashcard và mentor nhau qua từng dự án thực hành.
                  </p>

                  <div className="mt-8 grid gap-4">
                    {communityHighlights.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-4">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                            <p className="text-sm text-slate-500">{item.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button className="mt-8 w-full" size="lg" onClick={() => openAuthDialog("register")}>
                    Gia nhập cộng đồng ngay
                  </Button>
                </div>

                <div className="grid gap-6">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.name}
                      className="rounded-[28px] border border-white/70 bg-white/80 p-7 shadow-[0_30px_88px_-60px_rgba(14,23,42,0.65)]"
                    >
                      <Quote className="h-8 w-8 text-primary" />
                      <p className="mt-4 text-base leading-relaxed text-slate-600">“{testimonial.quote}”</p>
                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={testimonial.name.charAt(0)} size={42} />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                            <p className="text-xs text-slate-500">{testimonial.role}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {testimonial.achievement}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="cta" className="mt-24 overflow-hidden rounded-[36px] border border-primary/20 bg-gradient-to-br from-primary/30 via-indigo-500/35 to-sky-400/35 p-8 text-white shadow-[0_40px_120px_-65px_rgba(37,99,235,0.7)] sm:p-12">
              <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-5">
                  <h2 className="text-3xl font-semibold leading-tight text-transparent bg-gradient-to-r from-white via-sky-100 to-emerald-200 bg-clip-text sm:text-4xl">
                    Sẵn sàng đồng hành cùng bạn trong từng mục tiêu học tập
                  </h2>
                  <p className="text-base text-white/85">
                    Kích hoạt ngay tài khoản SmartLearn để được mentor AI hỗ trợ 1:1, truy cập kho bài học chất lượng cao và tham gia cùng cộng đồng học viên siêu nhiệt huyết.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="lg" variant="secondary" onClick={() => openAuthDialog("register")}>
                      <Sparkles className="h-4 w-4" />
                      Nhận 14 ngày dùng thử
                    </Button>
                    <Button variant="ghost" size="lg" className="text-white hover:text-white" onClick={() => openAuthDialog("login")}>
                      Đã có tài khoản? Đăng nhập
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/75">
                    <span className="inline-flex h-9 items-center gap-2 rounded-full bg-white/20 px-4 py-1">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Android & iOS
                    </span>
                    <span className="inline-flex h-9 items-center gap-2 rounded-full bg-white/20 px-4 py-1">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 7h6M9 12h6M9 17h6" />
                      </svg>
                      Web & Tablet
                    </span>
                  </div>
                </div>

                <div className="relative rounded-[28px] border border-white/40 bg-white/15 p-6 backdrop-blur-2xl">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/70">BẠN SẼ NHẬN ĐƯỢC</p>
                  <ul className="mt-4 space-y-3 text-sm text-white/85">
                    <li className="flex items-start gap-3">
                      <Sparkles className="mt-1 h-4 w-4" />
                      Gợi ý bài học cá nhân hóa dựa trên năng lực hiện tại.
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="mt-1 h-4 w-4" />
                      Bảo mật tuyệt đối, dữ liệu học tập được mã hóa end-to-end.
                    </li>
                    <li className="flex items-start gap-3">
                      <CalendarCheck className="mt-1 h-4 w-4" />
                      Lịch học linh hoạt, đồng bộ với Google Calendar và ứng dụng di động.
                    </li>
                    <li className="flex items-start gap-3">
                      <Users2 className="mt-1 h-4 w-4" />
                      Mentoring nhóm và cộng đồng hàng ngàn học viên nhiệt huyết.
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </main>

          <footer className="border-t border-white/60 bg-gradient-to-r from-[#ebe7ff]/95 via-[#e6f0ff]/95 to-[#f2e8ff]/95 py-12">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 text-sm text-slate-600 md:grid-cols-[1.2fr_0.8fr] lg:grid-cols-[1.2fr_1fr_0.8fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <SmartImage
                    src={view.hero.brand.logoSrc}
                    alt={view.hero.brand.logoAlt}
                    className="h-12 w-12"
                    imageClassName="h-full w-full object-contain"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">{view.hero.eyebrow}</p>
                    <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text">
                      {view.hero.brand.name}
                    </h3>
                  </div>
                </div>
                <p className="max-w-md text-sm text-slate-500">
                  SmartLearn đồng hành trên web, Android và iOS. Đồng bộ tiến độ tức thời, học mọi lúc dù ở nhà hay trên đường.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#platforms"
                    className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-600 to-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_36px_-18px_rgba(79,70,229,0.65)]"
                  >
                    <Play className="h-4 w-4" />
                    Google Play
                  </a>
                  <a
                    href="#platforms"
                    className="group inline-flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-800 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]"
                  >
                    <Apple className="h-4 w-4" />
                    App Store
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {["Web App", "Android", "iOS"].map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1 text-xs font-semibold text-primary"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Khám phá</p>
                  <div className="grid gap-2 text-sm">
                    <a href="#features" className="transition-colors hover:text-slate-800">Tính năng</a>
                    <a href="#journey" className="transition-colors hover:text-slate-800">Lộ trình AI</a>
                    <a href="#community" className="transition-colors hover:text-slate-800">Cộng đồng</a>
                    <a href="#cta" className="transition-colors hover:text-slate-800">Đăng ký</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Tài nguyên</p>
                  <div className="grid gap-2 text-sm">
                    <a href="#" className="transition-colors hover:text-slate-800">Trung tâm trợ giúp</a>
                    <a href="#" className="transition-colors hover:text-slate-800">Học liệu miễn phí</a>
                    <a href="#" className="transition-colors hover:text-slate-800">Blog thông tin</a>
                    <a href="#" className="transition-colors hover:text-slate-800">Cộng tác mentor</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Kết nối</p>
                  <div className="grid gap-2 text-sm">
                    <a href="#" className="transition-colors hover:text-slate-800">Facebook</a>
                    <a href="#" className="transition-colors hover:text-slate-800">YouTube</a>
                    <a href="#" className="transition-colors hover:text-slate-800">TikTok</a>
                    <a href="#" className="transition-colors hover:text-slate-800">LinkedIn</a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Nhận bản tin</p>
                <p className="text-sm text-slate-500">
                  Cập nhật chiến lược học tập, ra mắt tính năng mới và suất mentor 1:1 hàng tháng.
                </p>
                <Button size="lg" className="w-full" onClick={() => openAuthDialog("register")}>Đăng ký dùng thử</Button>
                <p className="text-xs text-slate-400">
                  © {currentYear} {view.hero.brand.name}. Điều khoản & Chính sách bảo mật.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>

  <DialogContent className="z-[120] max-w-5xl overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-6xl">
        <div className="grid gap-0 overflow-hidden rounded-[32px] border border-white/60 bg-white/95 shadow-[0_40px_120px_-55px_rgba(15,23,42,0.6)] md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden flex-col gap-8 bg-gradient-to-br from-primary/90 via-indigo-700 to-sky-700 p-10 text-white md:flex">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
                <Sparkles className="h-4 w-4" />
                {view.hero.brand.tagline}
              </span>
              <h3 className="mt-6 text-3xl font-semibold leading-tight">{view.hero.headline}</h3>
              <p className="mt-4 text-sm text-white/80">{view.hero.subheadline}</p>
            </div>
            <div className="relative flex justify-center">
              <div className="absolute -inset-x-12 top-8 h-64 rounded-full bg-white/25 blur-3xl" />
              <SmartImage
                src={view.hero.illustration.src}
                alt={view.hero.illustration.alt}
                className="relative w-full max-w-xs"
                imageClassName="w-full object-contain"
                rounded="rounded-[30px]"
                loading="lazy"
              />
            </div>
            <div className="space-y-4">
              {["Mentor AI theo sát tiến độ", "Cộng đồng học viên 58K+", "Bảo mật cấp doanh nghiệp"].map((bullet) => (
                <div key={bullet} className="flex items-center gap-3 text-sm font-medium text-white/85">
                  <ShieldCheck className="h-5 w-5" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-3 text-xs text-white/70">
              <SmartImage
                src={view.hero.brand.logoSrc}
                alt={view.hero.brand.logoAlt}
                className="h-9 w-9 rounded-2xl bg-white/15 p-2"
                imageClassName="object-contain"
              />
              <div>
                <p className="font-semibold">{view.hero.brand.name}</p>
                <p>Cá nhân hoá từng phút học của bạn</p>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col gap-6 p-6 sm:p-8">
            <div className="absolute -top-24 left-12 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-10 right-2 h-32 w-32 rounded-full bg-sky-200/50 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:hidden">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-indigo-600 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">{view.hero.brand.tagline}</p>
                <h3 className="mt-3 text-2xl font-semibold leading-snug">{view.hero.headline}</h3>
                <p className="mt-3 text-sm text-white/80">{view.hero.subheadline}</p>
              </div>
            </div>

            <DialogHeader className="relative text-left">
              <DialogTitle className="text-2xl font-semibold text-slate-900">{view.card.header.title}</DialogTitle>
              <DialogDescription className="text-base text-slate-500">
                {view.card.header.description}
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              <AuthTabs
                tabs={view.tabs}
                activeTab={view.activeTab}
                onTabChange={view.setActiveTab}
                content={{
                  login: (
                    <LoginForm
                      values={view.loginForm.values}
                      onFieldChange={view.loginForm.onFieldChange}
                      onSubmit={view.loginForm.onSubmit}
                      onGoogleSignIn={view.loginForm.onGoogleSignIn}
                      isSubmitting={view.loginForm.isSubmitting}
                      error={view.loginForm.error}
                    />
                  ),
                  register: (
                    <RegisterForm
                      values={view.registerForm.values}
                      onFieldChange={view.registerForm.onFieldChange}
                      onSubmit={view.registerForm.onSubmit}
                      isSubmitting={view.registerForm.isSubmitting}
                      error={view.registerForm.error}
                    />
                  )
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
