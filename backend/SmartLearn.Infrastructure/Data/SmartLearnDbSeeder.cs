using Bogus;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartLearn.Domain.Entities;
using SmartLearn.Domain.Enums;
using System.Text.Json;

namespace SmartLearn.Infrastructure.Data;

public static class SmartLearnDbSeeder
{
    private const int UserCount = 25;
    private const int LibrariesPerUser = 6;        // 25 × 6 = 150 libraries
    private const int CardsPerLibrary = 15;        // 150 × 15 = 2 250 cards
    private const int NotesPerUser = 8;            // 25 × 8 = 200 notes
    private const int StudyEventsPerUser = 30;     // 25 × 30 = 750 study events
    private const int NotificationsPerUser = 12;   // 25 × 12 = 300 notifications
    private const int SharesPerUser = 3;           // cross-user shares
    private const int FavoritesPerUser = 5;        // library + note favorites
    private const int FlagsPerUser = 20;           // card flags per user
    private const int Seed = 20260302;             // deterministic seed

    public static async Task SeedAsync(SmartLearnDbContext db, ILogger logger)
    {
        if (await db.Users.IgnoreQueryFilters().AnyAsync())
        {
            logger.LogInformation("Database already seeded — skipping.");
            return;
        }

        logger.LogInformation("Seeding database with Bogus fake data...");

        Randomizer.Seed = new Random(Seed);
        var faker = new Faker("vi");

        // ─── 1. Users ───────────────────────────────────────────
        var users = GenerateUsers(faker);
        db.Users.AddRange(users);

        // ─── 2. Libraries ───────────────────────────────────────
        var allLibraries = new List<Library>();
        foreach (var user in users)
        {
            var libs = GenerateLibraries(faker, user.Id);
            allLibraries.AddRange(libs);
        }
        db.Libraries.AddRange(allLibraries);

        // ─── 3. Cards ───────────────────────────────────────────
        var allCards = new List<Card>();
        foreach (var lib in allLibraries)
        {
            var cards = GenerateCards(faker, lib.Id);
            lib.CardCount = cards.Count;
            allCards.AddRange(cards);
        }
        db.Cards.AddRange(allCards);

        // ─── 4. Notes ───────────────────────────────────────────
        var allNotes = new List<Note>();
        foreach (var user in users)
        {
            var notes = GenerateNotes(faker, user.Id);
            allNotes.AddRange(notes);
        }
        db.Notes.AddRange(allNotes);

        // ─── 5. Study Events (for stats / calendar) ─────────────
        var allEvents = new List<StudyEvent>();
        foreach (var user in users)
        {
            var userLibs = allLibraries.Where(l => l.OwnerId == user.Id).ToList();
            var events = GenerateStudyEvents(faker, user.Id, userLibs);
            allEvents.AddRange(events);
        }
        db.StudyEvents.AddRange(allEvents);

        // ─── 6. Notifications ────────────────────────────────────
        var allNotifications = new List<Notification>();
        foreach (var user in users)
        {
            var notifs = GenerateNotifications(faker, user.Id);
            allNotifications.AddRange(notifs);
        }
        db.Notifications.AddRange(allNotifications);

        // ─── 7. Library Shares ───────────────────────────────────
        var allShares = GenerateShares(faker, users, allLibraries);
        db.LibraryShares.AddRange(allShares);

        // ─── 8. Access Requests ──────────────────────────────────
        var allRequests = GenerateAccessRequests(faker, users, allLibraries);
        db.AccessRequests.AddRange(allRequests);

        // ─── 9. User Favorites ───────────────────────────────────
        var allFavorites = GenerateFavorites(faker, users, allLibraries, allNotes);
        db.UserFavorites.AddRange(allFavorites);

        // ─── 10. Card Flags ──────────────────────────────────────
        var allFlags = GenerateCardFlags(faker, users, allLibraries, allCards);
        db.CardFlags.AddRange(allFlags);

        // ─── 11. User Library Progress ───────────────────────────
        var allProgress = GenerateProgress(faker, users, allLibraries, allCards);
        db.UserLibraryProgresses.AddRange(allProgress);

        await db.SaveChangesAsync();

        logger.LogInformation(
            "Seed complete: {Users} users, {Libs} libraries, {Cards} cards, " +
            "{Notes} notes, {Events} events, {Notifs} notifications, " +
            "{Shares} shares, {Flags} flags, {Progress} progress records.",
            users.Count, allLibraries.Count, allCards.Count,
            allNotes.Count, allEvents.Count, allNotifications.Count,
            allShares.Count, allFlags.Count, allProgress.Count);
    }

    // ═══════════════════════════════════════════════════════════════
    //  GENERATORS
    // ═══════════════════════════════════════════════════════════════

    private static List<User> GenerateUsers(Faker faker)
    {
        var themes  = new[] { "system", "light", "dark" };
        var density = new[] { "comfortable", "compact", "spacious" };
        var vis     = new[] { "public", "friends", "private" };
        var langs   = new[] { "vi", "en" };

        return Enumerable.Range(0, UserCount).Select(i =>
        {
            var firstName = faker.Name.FirstName();
            var lastName  = faker.Name.LastName();
            var email     = $"user{i + 1}@smartlearn.test";

            return new User
            {
                Id          = Guid.NewGuid(),
                Email       = email,
                DisplayName = $"{firstName} {lastName}",
                AvatarUrl   = $"https://i.pravatar.cc/150?u={email}",
                FirebaseUid = $"seed_uid_{i + 1:D3}",
                CreatedAt   = faker.Date.Between(new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                                                 new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc)),
                UpdatedAt   = DateTime.UtcNow,
                Settings = new UserSettings
                {
                    Profile = new ProfileSettings
                    {
                        DisplayName = $"{firstName} {lastName}",
                        Language    = faker.PickRandom(langs),
                        Timezone    = "Asia/Ho_Chi_Minh",
                        Bio         = faker.Lorem.Sentence(8, 5)
                    },
                    Notifications = new NotificationSettings
                    {
                        EmailNotifications = faker.Random.Bool(),
                        PushNotifications  = true,
                        StudyReminders     = faker.Random.Bool(),
                        WeeklySummary      = faker.Random.Bool()
                    },
                    Study = new StudySettings
                    {
                        DailyGoalMinutes = faker.PickRandom(15, 30, 45, 60, 90),
                        ReminderTime     = $"{faker.Random.Int(6, 21):D2}:00",
                        AutoAddEvents    = faker.Random.Bool()
                    },
                    Appearance = new AppearanceSettings
                    {
                        Theme      = faker.PickRandom(themes),
                        Density    = faker.PickRandom(density),
                        ShowConfetti = true
                    },
                    Privacy = new PrivacySettings
                    {
                        ProfileVisibility = faker.PickRandom(vis),
                        ShareActivity     = faker.Random.Bool(),
                        DataInsights      = true
                    }
                }
            };
        }).ToList();
    }

    private static readonly string[][] SubjectData =
    [
        // [subject, difficultyLabel, tag1, tag2, ...]
        ["Toán học",      "Trung bình", "đại-số", "hình-học", "giải-tích", "xác-suất"],
        ["Vật lý",        "Khó",        "cơ-học", "điện-từ", "quang-học", "nhiệt-học"],
        ["Hóa học",       "Trung bình", "hữu-cơ", "vô-cơ", "phản-ứng", "nguyên-tố"],
        ["Sinh học",      "Dễ",         "tế-bào", "di-truyền", "sinh-thái", "giải-phẫu"],
        ["Lịch sử",      "Dễ",         "việt-nam", "thế-giới", "cận-đại", "cổ-đại"],
        ["Địa lý",        "Dễ",         "tự-nhiên", "kinh-tế", "dân-cư", "khí-hậu"],
        ["Tiếng Anh",     "Trung bình", "ngữ-pháp", "từ-vựng", "IELTS", "TOEIC"],
        ["Tiếng Nhật",    "Khó",        "kanji", "ngữ-pháp", "N3", "N2"],
        ["Lập trình",     "Khó",        "C#", "Python", "thuật-toán", "OOP"],
        ["CNTT",          "Trung bình", "mạng", "CSDL", "hệ-điều-hành", "bảo-mật"],
        ["Kinh tế",       "Trung bình", "vi-mô", "vĩ-mô", "tài-chính", "marketing"],
        ["Triết học",     "Khó",        "logic", "đạo-đức", "siêu-hình", "nhận-thức"],
        ["Tâm lý học",   "Trung bình", "hành-vi", "phát-triển", "xã-hội", "lâm-sàng"],
        ["Văn học",       "Dễ",         "thơ", "truyện", "phê-bình", "lý-luận"],
        ["Âm nhạc",       "Dễ",         "nhạc-lý", "hòa-âm", "tiết-tấu", "thể-loại"],
    ];

    private static List<Library> GenerateLibraries(Faker faker, Guid ownerId)
    {
        return Enumerable.Range(0, LibrariesPerUser).Select(i =>
        {
            var subj = faker.PickRandom(SubjectData);
            var tags = faker.PickRandom(subj.Skip(2).ToArray(), faker.Random.Int(2, 3)).ToList();

            return new Library
            {
                Id              = Guid.NewGuid(),
                OwnerId         = ownerId,
                Title           = $"{subj[0]} – Bộ {faker.Random.Int(1, 50)}",
                Description     = faker.Lorem.Paragraph(3),
                Subject         = subj[0],
                DifficultyLabel = subj[1],
                Tags            = JsonSerializer.Serialize(tags),
                Visibility      = faker.PickRandom<LibraryVisibility>(),
                CardCount       = 0, // updated after card generation
                CreatedAt       = faker.Date.Between(new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                                                     new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc)),
                UpdatedAt       = DateTime.UtcNow
            };
        }).ToList();
    }

    private static readonly Dictionary<string, (string front, string back)[]> FlashcardBank = new()
    {
        ["Toán học"] =
        [
            ("Công thức nghiệm phương trình bậc 2?", "x = (-b ± √(b² - 4ac)) / 2a"),
            ("Đạo hàm của sin(x)?", "cos(x)"),
            ("Tích phân của 1/x dx?", "ln|x| + C"),
            ("Công thức diện tích hình tròn?", "S = πr²"),
            ("Giới hạn của sin(x)/x khi x→0?", "1"),
            ("Đạo hàm của eˣ?", "eˣ"),
            ("Công thức tổ hợp C(n,k)?", "n! / (k!(n-k)!)"),
            ("Định lý Pythagore?", "a² + b² = c²"),
            ("Tích phân ∫cos(x)dx?", "sin(x) + C"),
            ("Logarit cơ số e gọi là gì?", "Logarit tự nhiên (ln)"),
            ("Công thức diện tích tam giác?", "S = ½ × a × h"),
            ("Đạo hàm của ln(x)?", "1/x"),
            ("Số Pi xấp xỉ bằng?", "3.14159265..."),
            ("Ma trận đơn vị I có tính chất gì?", "AI = IA = A"),
            ("Chuỗi Taylor của eˣ?", "Σ xⁿ/n! (n=0 → ∞)"),
        ],
        ["Vật lý"] =
        [
            ("Định luật II Newton?", "F = ma"),
            ("Công thức năng lượng Einstein?", "E = mc²"),
            ("Định luật bảo toàn năng lượng?", "Năng lượng không tự sinh ra hay mất đi, chỉ chuyển hóa từ dạng này sang dạng khác"),
            ("Công thức vận tốc đều?", "v = s/t"),
            ("Gia tốc trọng trường g ≈?", "9.8 m/s²"),
            ("Định luật Ohm?", "U = IR"),
            ("Công suất điện?", "P = UI"),
            ("Tần số là gì?", "Số dao động trong 1 giây (Hz)"),
            ("Công thức động năng?", "Eₖ = ½mv²"),
            ("Thế năng trọng trường?", "Eₚ = mgh"),
            ("Bước sóng λ = ?", "v / f"),
            ("Định luật Coulomb?", "F = kq₁q₂/r²"),
            ("Lực đẩy Archimedes?", "F = ρ × V × g"),
            ("Chu kì con lắc đơn T = ?", "2π√(l/g)"),
            ("Quang phổ ánh sáng trắng gồm?", "Đỏ, cam, vàng, lục, lam, chàm, tím"),
        ],
        ["Hóa học"] =
        [
            ("Công thức nước?", "H₂O"),
            ("pH trung tính = ?", "7"),
            ("Khí CO₂ gọi là?", "Carbon dioxide"),
            ("Liên kết ion là gì?", "Liên kết hình thành do lực hút tĩnh điện giữa các ion trái dấu"),
            ("Nguyên tử nhỏ nhất?", "Hydrogen (H)"),
            ("Số Avogadro ≈ ?", "6.022 × 10²³"),
            ("NaCl là gì?", "Muối ăn (Natri Clorua)"),
            ("Phản ứng oxi hóa khử là gì?", "Phản ứng có sự thay đổi số oxi hóa"),
            ("Axit mạnh ví dụ?", "HCl, H₂SO₄, HNO₃"),
            ("Kim loại kiềm thuộc nhóm?", "Nhóm IA"),
            ("Cấu hình electron của Carbon?", "1s² 2s² 2p²"),
            ("Khối lượng mol H₂O = ?", "18 g/mol"),
            ("Nguyên tố halogen?", "F, Cl, Br, I, At"),
            ("Tốc độ phản ứng phụ thuộc vào?", "Nồng độ, nhiệt độ, chất xúc tác, diện tích bề mặt"),
            ("Dung dịch bão hòa là?", "Dung dịch không thể hòa tan thêm chất tan ở nhiệt độ đó"),
        ],
        ["Tiếng Anh"] =
        [
            ("What is the past tense of 'go'?", "went"),
            ("Synonym of 'big'?", "large, huge, enormous"),
            ("Present Perfect tense structure?", "S + have/has + V3 (past participle)"),
            ("What does 'ubiquitous' mean?", "Present, appearing, or found everywhere"),
            ("Difference between 'affect' and 'effect'?", "Affect = verb (tác động), Effect = noun (hiệu ứng)"),
            ("Conditional Type 2 structure?", "If + S + V2, S + would/could + V"),
            ("What is a gerund?", "A verb form ending in -ing used as a noun"),
            ("Passive voice structure?", "S + be + V3 (+ by agent)"),
            ("Reported speech: 'I am happy' →?", "He said (that) he was happy"),
            ("What does 'procrastinate' mean?", "To delay or postpone action"),
            ("Comparative form of 'good'?", "better"),
            ("Superlative form of 'bad'?", "worst"),
            ("Article 'a' vs 'an'?", "'an' before vowel sounds, 'a' before consonant sounds"),
            ("What is a clause?", "A group of words with a subject and predicate"),
            ("IELTS band score range?", "0 to 9"),
        ],
        ["Lập trình"] =
        [
            ("OOP 4 tính chất?", "Đóng gói, Kế thừa, Đa hình, Trừu tượng"),
            ("Big O của Binary Search?", "O(log n)"),
            ("SOLID – S là gì?", "Single Responsibility Principle"),
            ("Stack vs Queue?", "Stack: LIFO, Queue: FIFO"),
            ("Dependency Injection là gì?", "Design pattern tách biệt việc khởi tạo dependency ra ngoài class"),
            ("REST API là gì?", "Kiến trúc API dựa trên HTTP methods (GET, POST, PUT, DELETE)"),
            ("Git merge vs rebase?", "Merge: tạo commit mới hợp nhất, Rebase: áp commit lên nhánh base"),
            ("Async/Await dùng để?", "Xử lý bất đồng bộ mà không block thread"),
            ("Design Pattern là gì?", "Giải pháp tổng quát cho các vấn đề phổ biến trong thiết kế phần mềm"),
            ("SQL JOIN có mấy loại?", "INNER, LEFT, RIGHT, FULL, CROSS"),
            ("Thuật toán sắp xếp nhanh nhất?", "QuickSort – trung bình O(n log n)"),
            ("Interface vs Abstract class (C#)?", "Interface: chỉ khai báo, Abstract: có thể định nghĩa sẵn một số method"),
            ("Docker container là gì?", "Đơn vị phần mềm đóng gói code + dependencies để chạy nhất quán"),
            ("Unit Test là gì?", "Kiểm thử từng đơn vị/hàm riêng lẻ"),
            ("Clean Architecture gồm mấy lớp?", "Domain, Application, Infrastructure, Presentation"),
        ],
        ["Lịch sử"] =
        [
            ("Việt Nam thống nhất năm?", "1975"),
            ("Cách mạng tháng 8 năm?", "1945"),
            ("Trận Điện Biên Phủ năm?", "1954"),
            ("Thế chiến II kết thúc năm?", "1945"),
            ("Vua lập triều Lý là ai?", "Lý Thái Tổ (Lý Công Uẩn)"),
            ("Chiến thắng Bạch Đằng năm 938 do ai?", "Ngô Quyền"),
            ("Cách mạng Pháp năm?", "1789"),
            ("Ai phát hiện châu Mỹ 1492?", "Christopher Columbus"),
            ("Bức tường Berlin sụp đổ năm?", "1989"),
            ("Chiến tranh lạnh kéo dài?", "1947 – 1991"),
            ("Triều Nguyễn bắt đầu năm?", "1802"),
            ("Quang Trung đại phá quân Thanh năm?", "1789"),
            ("Đế quốc La Mã sụp đổ năm?", "476"),
            ("Nhà Trần thắng quân Nguyên lần 3 năm?", "1288"),
            ("Hiến pháp Mỹ ra đời năm?", "1787"),
        ],
        ["Sinh học"] =
        [
            ("ADN viết tắt của?", "Axit Deoxyribonucleic"),
            ("Quang hợp diễn ra ở đâu?", "Lục lạp (chloroplast)"),
            ("Ti thể có chức năng gì?", "Sản xuất ATP – cung cấp năng lượng cho tế bào"),
            ("Gen là gì?", "Đơn vị di truyền nằm trên ADN, mã hóa protein"),
            ("Đột biến gen là gì?", "Sự thay đổi trong trình tự nucleotide của ADN"),
            ("Chuỗi thức ăn bắt đầu từ?", "Sinh vật sản xuất (thực vật)"),
            ("Máu gồm mấy thành phần chính?", "Huyết tương, hồng cầu, bạch cầu, tiểu cầu"),
            ("Số NST người 2n = ?", "46"),
            ("Enzym là gì?", "Chất xúc tác sinh học, tăng tốc phản ứng hóa sinh"),
            ("Hô hấp tế bào là?", "Quá trình phân giải glucose tạo ATP"),
            ("Hệ tuần hoàn gồm?", "Tim, mạch máu, máu"),
            ("ARN gồm mấy loại?", "3: mARN, tARN, rARN"),
            ("Nguyên phân tạo bao nhiêu tế bào?", "2 tế bào con giống tế bào mẹ"),
            ("Giảm phân tạo bao nhiêu tế bào?", "4 tế bào con có n NST"),
            ("Darwin đề xuất thuyết gì?", "Thuyết tiến hóa bằng chọn lọc tự nhiên"),
        ],
    };

    // Fallback card generator for subjects not in FlashcardBank
    private static (string front, string back) GenerateGenericCard(Faker faker, string subject, int index)
    {
        return (
            $"{subject}: Câu hỏi #{index + 1} – {faker.Lorem.Sentence(5, 3)}",
            faker.Lorem.Sentence(8, 5)
        );
    }

    private static List<Card> GenerateCards(Faker faker, Guid libraryId)
    {
        var count = faker.Random.Int(CardsPerLibrary - 5, CardsPerLibrary + 5); // 10–20
        return Enumerable.Range(0, count).Select(i =>
        {
            // Pick a random subject bank or fall back to generic
            var bankKey = faker.PickRandom(FlashcardBank.Keys.ToArray());
            var bank = FlashcardBank[bankKey];
            var template = i < bank.Length
                ? bank[i]
                : GenerateGenericCard(faker, bankKey, i);

            return new Card
            {
                Id         = Guid.NewGuid(),
                LibraryId  = libraryId,
                Front      = template.front,
                Back       = template.back,
                Difficulty = faker.PickRandom(new Difficulty?[] { Difficulty.Easy, Difficulty.Medium, Difficulty.Hard, null }),
                Domain     = bankKey,
                CreatedAt  = faker.Date.Between(new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                                                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc)),
                UpdatedAt  = DateTime.UtcNow
            };
        }).ToList();
    }

    private static List<Note> GenerateNotes(Faker faker, Guid ownerId)
    {
        var subjects = new[]
        {
            "Tóm tắt bài giảng", "Ghi chú ôn thi", "Công thức cần nhớ",
            "Từ vựng mới", "Bài tập mẫu", "Ý tưởng dự án",
            "Reading notes", "Thảo luận nhóm"
        };

        return Enumerable.Range(0, NotesPerUser).Select(i =>
        {
            var blocks = Enumerable.Range(0, faker.Random.Int(3, 8)).Select(j => new
            {
                id = Guid.NewGuid().ToString(),
                type = faker.PickRandom("paragraph", "heading", "bulletListItem", "numberedListItem"),
                content = new[]
                {
                    new { type = "text", text = faker.Lorem.Sentence(faker.Random.Int(5, 20)) }
                }
            });

            return new Note
            {
                Id         = Guid.NewGuid(),
                OwnerId    = ownerId,
                Title      = $"{faker.PickRandom(subjects)} – {faker.Date.Recent(90):dd/MM}",
                Content    = JsonSerializer.Serialize(blocks),
                Tags       = JsonSerializer.Serialize(faker.PickRandom(
                    new[] { "ôn-thi", "ghi-chú", "quan-trọng", "cần-xem-lại", "tóm-tắt", "bài-giảng", "thực-hành" },
                    faker.Random.Int(1, 3)).ToList()),
                Visibility = faker.PickRandom<NoteVisibility>(),
                CreatedAt  = faker.Date.Between(new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                                                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc)),
                UpdatedAt  = DateTime.UtcNow
            };
        }).ToList();
    }

    private static List<StudyEvent> GenerateStudyEvents(Faker faker, Guid userId, List<Library> userLibs)
    {
        var events = new List<StudyEvent>();

        // Past 90 days — mix of completed / missed (for stats)
        for (int day = 90; day >= 1; day--)
        {
            var sessionsToday = faker.Random.Int(0, 3); // 0–3 sessions per day
            for (int s = 0; s < sessionsToday && events.Count < StudyEventsPerUser - 5; s++)
            {
                var date = DateTime.UtcNow.Date.AddDays(-day);
                var start = date.AddHours(faker.Random.Int(7, 21)).AddMinutes(faker.Random.Int(0, 59));
                var dur = faker.Random.Int(10, 90);
                var completed = faker.Random.WeightedRandom([true, false], [0.75f, 0.25f]);
                var lib = faker.PickRandom(userLibs);

                events.Add(new StudyEvent
                {
                    Id           = Guid.NewGuid(),
                    UserId       = userId,
                    Title        = $"Ôn tập {lib.Subject ?? "Flashcards"}",
                    Description  = faker.Lorem.Sentence(5),
                    StartTime    = start,
                    EndTime      = start.AddMinutes(dur),
                    Type         = faker.PickRandom<StudyEventType>(),
                    Status       = completed ? StudyEventStatus.Completed : StudyEventStatus.Missed,
                    FlashcardSet = lib.Title,
                    CardCount    = faker.Random.Int(5, 30),
                    LibraryId    = lib.Id,
                    AutoScheduled = faker.Random.Bool(),
                    LastChoice   = completed ? faker.PickRandom(new LastChoice?[] { LastChoice.Normal, LastChoice.Hard, LastChoice.Again, LastChoice.VeryHard }) : null,
                    CompletedAt  = completed ? start.AddMinutes(dur) : null,
                    CreatedAt    = start.AddDays(-1),
                    UpdatedAt    = completed ? start.AddMinutes(dur) : start
                });
            }
        }

        // Future 14 days — upcoming events
        for (int day = 1; day <= 14; day++)
        {
            if (faker.Random.Bool(0.6f) && events.Count < StudyEventsPerUser)
            {
                var date = DateTime.UtcNow.Date.AddDays(day);
                var start = date.AddHours(faker.Random.Int(7, 21));
                var lib = faker.PickRandom(userLibs);

                events.Add(new StudyEvent
                {
                    Id           = Guid.NewGuid(),
                    UserId       = userId,
                    Title        = $"Lịch học {lib.Subject ?? "Flashcards"}",
                    Description  = faker.Lorem.Sentence(5),
                    StartTime    = start,
                    EndTime      = start.AddMinutes(faker.Random.Int(30, 60)),
                    Type         = faker.PickRandom(StudyEventType.Review, StudyEventType.Study),
                    Status       = StudyEventStatus.Upcoming,
                    FlashcardSet = lib.Title,
                    CardCount    = faker.Random.Int(10, 25),
                    LibraryId    = lib.Id,
                    AutoScheduled = true,
                    CreatedAt    = DateTime.UtcNow,
                    UpdatedAt    = DateTime.UtcNow
                });
            }
        }

        return events;
    }

    private static List<Notification> GenerateNotifications(Faker faker, Guid userId)
    {
        var types = new[]
        {
            ("study_reminder",   "Nhắc nhở học tập",     "Đã đến giờ ôn tập hàng ngày!"),
            ("share_received",   "Thư viện được chia sẻ", "Bạn có thư viện mới được chia sẻ."),
            ("streak_milestone", "Chuỗi ngày học",        "Chúc mừng! Bạn đã học liên tục {0} ngày."),
            ("weekly_summary",   "Tóm tắt tuần",         "Tuần này bạn đã học {0} phút với {1} thẻ."),
            ("access_approved",  "Yêu cầu được duyệt",  "Yêu cầu truy cập thư viện đã được chấp nhận."),
            ("new_cards",        "Thẻ mới",              "Có {0} thẻ mới được thêm vào thư viện của bạn."),
            ("achievement",      "Thành tích",            "Bạn đã hoàn thành {0} buổi học!"),
            ("system",           "Hệ thống",             "Phiên bản mới đã được cập nhật."),
        };

        return Enumerable.Range(0, NotificationsPerUser).Select(i =>
        {
            var t = faker.PickRandom(types);
            var msg = string.Format(t.Item3,
                faker.Random.Int(5, 30),
                faker.Random.Int(50, 200));

            return new Notification
            {
                Id        = Guid.NewGuid(),
                UserId    = userId,
                Type      = t.Item1,
                Title     = t.Item2,
                Message   = msg,
                Read      = faker.Random.Bool(0.4f),
                Data      = JsonSerializer.Serialize(new { streak = faker.Random.Int(1, 60), minutesStudied = faker.Random.Int(30, 300) }),
                CreatedAt = faker.Date.Between(DateTime.UtcNow.AddDays(-30), DateTime.UtcNow),
                UpdatedAt = DateTime.UtcNow
            };
        }).ToList();
    }

    private static List<LibraryShare> GenerateShares(Faker faker, List<User> users, List<Library> allLibraries)
    {
        var shares = new List<LibraryShare>();
        var existing = new HashSet<(Guid libId, Guid targetUserId)>();

        foreach (var user in users)
        {
            var otherUsers = users.Where(u => u.Id != user.Id).ToList();
            var userLibs = allLibraries.Where(l => l.OwnerId == user.Id).ToList();

            for (int i = 0; i < SharesPerUser && userLibs.Count > 0; i++)
            {
                var lib = faker.PickRandom(userLibs);
                var target = faker.PickRandom(otherUsers);
                var key = (lib.Id, target.Id);

                if (existing.Contains(key)) continue;
                existing.Add(key);

                shares.Add(new LibraryShare
                {
                    Id           = Guid.NewGuid(),
                    LibraryId    = lib.Id,
                    GrantedBy    = user.Id,
                    TargetUserId = target.Id,
                    Role         = faker.PickRandom<ShareRole>(),
                    CreatedAt    = faker.Date.Recent(60),
                    UpdatedAt    = DateTime.UtcNow
                });
            }
        }

        return shares;
    }

    private static List<AccessRequest> GenerateAccessRequests(Faker faker, List<User> users, List<Library> allLibraries)
    {
        var requests = new List<AccessRequest>();
        var existing = new HashSet<(Guid requesterId, Guid libId)>();
        var statuses = Enum.GetValues<AccessRequestStatus>();

        // Create ~40 access requests across users
        for (int i = 0; i < 40; i++)
        {
            var requester = faker.PickRandom(users);
            var otherLibs = allLibraries.Where(l => l.OwnerId != requester.Id).ToList();
            if (otherLibs.Count == 0) continue;

            var lib = faker.PickRandom(otherLibs);
            var key = (requester.Id, lib.Id);
            if (existing.Contains(key)) continue;
            existing.Add(key);

            requests.Add(new AccessRequest
            {
                Id          = Guid.NewGuid(),
                LibraryId   = lib.Id,
                RequesterId = requester.Id,
                OwnerId     = lib.OwnerId,
                Status      = faker.PickRandom(statuses),
                CreatedAt   = faker.Date.Recent(30),
                UpdatedAt   = DateTime.UtcNow
            });
        }

        return requests;
    }

    private static List<UserFavorite> GenerateFavorites(
        Faker faker, List<User> users, List<Library> allLibraries, List<Note> allNotes)
    {
        var favorites = new List<UserFavorite>();
        var existing = new HashSet<(Guid userId, Guid targetId, FavoriteType type)>();

        foreach (var user in users)
        {
            // Favorite some libraries (own + others)
            var libs = faker.PickRandom(allLibraries, Math.Min(FavoritesPerUser, allLibraries.Count));
            foreach (var lib in libs)
            {
                var key = (user.Id, lib.Id, FavoriteType.Library);
                if (existing.Contains(key)) continue;
                existing.Add(key);

                favorites.Add(new UserFavorite
                {
                    Id       = Guid.NewGuid(),
                    UserId   = user.Id,
                    TargetId = lib.Id,
                    Type     = FavoriteType.Library,
                    CreatedAt = faker.Date.Recent(60),
                    UpdatedAt = DateTime.UtcNow
                });
            }

            // Favorite some notes
            var notesToFav = faker.PickRandom(allNotes, Math.Min(2, allNotes.Count));
            foreach (var note in notesToFav)
            {
                var key = (user.Id, note.Id, FavoriteType.Note);
                if (existing.Contains(key)) continue;
                existing.Add(key);

                favorites.Add(new UserFavorite
                {
                    Id       = Guid.NewGuid(),
                    UserId   = user.Id,
                    TargetId = note.Id,
                    Type     = FavoriteType.Note,
                    CreatedAt = faker.Date.Recent(60),
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        return favorites;
    }

    private static List<CardFlag> GenerateCardFlags(
        Faker faker, List<User> users, List<Library> allLibraries, List<Card> allCards)
    {
        var flags = new List<CardFlag>();
        var existing = new HashSet<(Guid userId, Guid cardId)>();

        foreach (var user in users)
        {
            var randomCards = faker.PickRandom(allCards, Math.Min(FlagsPerUser, allCards.Count));

            foreach (var card in randomCards)
            {
                var key = (user.Id, card.Id);
                if (existing.Contains(key)) continue;
                existing.Add(key);

                flags.Add(new CardFlag
                {
                    Id         = Guid.NewGuid(),
                    UserId     = user.Id,
                    LibraryId  = card.LibraryId,
                    CardId     = card.Id,
                    Starred    = faker.Random.Bool(0.3f),
                    Difficulty = faker.PickRandom(new Difficulty?[] { Difficulty.Easy, Difficulty.Medium, Difficulty.Hard, null }),
                    CreatedAt  = faker.Date.Recent(45),
                    UpdatedAt  = DateTime.UtcNow
                });
            }
        }

        return flags;
    }

    private static List<UserLibraryProgress> GenerateProgress(
        Faker faker, List<User> users, List<Library> allLibraries, List<Card> allCards)
    {
        var progress = new List<UserLibraryProgress>();
        var existing = new HashSet<(Guid userId, Guid libId)>();

        foreach (var user in users)
        {
            // Progress for own libraries + some shared ones
            var libs = allLibraries
                .Where(l => l.OwnerId == user.Id)
                .Concat(faker.PickRandom(allLibraries.Where(l => l.OwnerId != user.Id), 2))
                .ToList();

            foreach (var lib in libs)
            {
                var key = (user.Id, lib.Id);
                if (existing.Contains(key)) continue;
                existing.Add(key);

                var libCards = allCards.Where(c => c.LibraryId == lib.Id).ToList();
                var totalCards = libCards.Count;
                var learned = faker.Random.Int(0, totalCards);
                var mastered = faker.Random.Int(0, learned);

                // Simulated LearnEngine state
                var engineState = new
                {
                    totalCards,
                    learned,
                    mastered,
                    remaining = totalCards - learned,
                    accuracy = totalCards > 0
                        ? Math.Round((double)mastered / totalCards * 100, 1)
                        : 0,
                    lastStudied = faker.Date.Recent(14).ToString("O"),
                    sessionCount = faker.Random.Int(1, 30),
                    streakDays = faker.Random.Int(0, 15),
                    cardStates = libCards.Select(c => new
                    {
                        cardId = c.Id,
                        interval = faker.Random.Int(1, 30),
                        easeFactor = Math.Round(faker.Random.Double(1.3, 3.0), 2),
                        repetitions = faker.Random.Int(0, 12),
                        nextReview = faker.Date.Soon(faker.Random.Int(1, 14)).ToString("O"),
                        status = faker.PickRandom("new", "learning", "review", "mastered")
                    }).ToList()
                };

                progress.Add(new UserLibraryProgress
                {
                    Id          = Guid.NewGuid(),
                    UserId      = user.Id,
                    LibraryId   = lib.Id,
                    EngineState = JsonSerializer.Serialize(engineState),
                    CreatedAt   = faker.Date.Recent(60),
                    UpdatedAt   = DateTime.UtcNow
                });
            }
        }

        return progress;
    }
}
