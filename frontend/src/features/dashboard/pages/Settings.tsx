import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save, Settings2 } from 'lucide-react';
import { Loader } from '@/shared/components/ui/loader';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

import { PageHeader } from '@/shared/components/PageHeader';
import { PageSection } from '@/shared/components/PageSection';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  userRepository,
  defaultUserSettings,
  mergeUserSettings,
  type UserSettings,
  type UserSettingsUpdate,
} from '@/shared/lib/repositories/UserRepository';
import { useAuth } from '@/shared/hooks/useAuthRedux';

type SettingsSectionKey = keyof Required<UserSettings>;

const themeOptions = [
  { value: 'system' as const, label: 'Theo hệ thống' },
  { value: 'light' as const, label: 'Sáng' },
  { value: 'dark' as const, label: 'Tối' },
];

const appearanceThemes = ['system', 'light', 'dark'] as const;
type AppearanceTheme = typeof appearanceThemes[number];
const isAppearanceTheme = (value: string): value is AppearanceTheme =>
  (appearanceThemes as readonly string[]).includes(value);

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const authDisplayName = typeof user?.displayName === 'string' ? user.displayName : '';
  const authEmail = typeof user?.email === 'string' ? user.email : '';

  const baseline = useMemo(
    () =>
      mergeUserSettings(undefined, {
        profile: { displayName: authDisplayName || defaultUserSettings.profile.displayName },
      }),
    [authDisplayName],
  );
  const [settings, setSettings] = useState<UserSettings>(baseline);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SettingsSectionKey | 'all' | null>(null);

  useEffect(() => {
    setSettings((prev) => mergeUserSettings(prev, { profile: baseline.profile }));
  }, [baseline]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = userRepository.listenUserSettings((incoming) => {
      setSettings(mergeUserSettings(baseline, incoming));
      setLoading(false);
    });
    return unsubscribe;
  }, [baseline]);

  const updateSettingsState = useCallback((patch: UserSettingsUpdate) => {
    setSettings((prev) => mergeUserSettings(prev, patch));
  }, []);

  const handleSaveSection = useCallback(
    async (section: SettingsSectionKey) => {
      const payload: UserSettingsUpdate = {
        [section]: settings[section],
      } as UserSettingsUpdate;
      setSaving(section);
      try {
        const updated = await userRepository.updateUserSettings(payload);
        setSettings(updated);
        toast.success('Đã lưu cài đặt thành công!', {
          description: 'Cài đặt của bạn đã được cập nhật.',
        });
      } catch (error) {
        console.error('Failed to save settings section', error);
        toast.error('Không thể lưu cài đặt', {
          description: 'Vui lòng thử lại sau.',
        });
      } finally {
        setSaving(null);
      }
    },
    [settings],
  );

  const profile = settings.profile || defaultUserSettings.profile;
  const study = settings.study || defaultUserSettings.study;
  const appearance = settings.appearance || defaultUserSettings.appearance;

  // Handle theme change with immediate feedback
  const handleThemeChange = useCallback((newTheme: string) => {
    if (!isAppearanceTheme(newTheme)) {
      console.warn('Unsupported theme value received:', newTheme);
      return;
    }
    setTheme(newTheme);
    updateSettingsState({ appearance: { theme: newTheme } });
    toast.success('Đã thay đổi giao diện!', {
      description: `Chuyển sang chủ đề ${newTheme === 'light' ? 'sáng' : newTheme === 'dark' ? 'tối' : 'theo hệ thống'}`,
    });
  }, [setTheme, updateSettingsState]);

  return (
    <div className="space-y-8 sm:space-y-12">
      <PageHeader
        title="Cài đặt"
        eyebrow="Tùy chỉnh tài khoản"
        description="Quản lý thông tin cá nhân và tùy chọn học tập của bạn."
        icon={<Settings2 className="h-6 w-6 text-primary" />}
      />

      <PageSection
        heading="Thông tin cá nhân"
        description="Cập nhật thông tin hiển thị của bạn."
        actions={
          <Button size="lg" onClick={() => handleSaveSection('profile')} disabled={saving !== null}>
            {saving === 'profile' ? <span className="mr-2 scale-50"><Loader size="sm" /></span> : <Save className="mr-2 h-4 w-4" />}
            Lưu
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input
              id="displayName"
              value={profile.displayName || ''}
              onChange={(event) =>
                updateSettingsState({ profile: { displayName: event.target.value } })
              }
              placeholder="Tên sẽ xuất hiện với người khác"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={authEmail} disabled readOnly className="bg-muted" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="bio">Giới thiệu ngắn</Label>
            <Textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(event) => updateSettingsState({ profile: { bio: event.target.value } })}
              rows={4}
              placeholder="Chia sẻ đôi nét về cách bạn học tập, lĩnh vực yêu thích..."
            />
          </div>
        </div>
      </PageSection>

      <PageSection
        heading="Học tập & Nhắc nhở"
        description="Cài đặt mục tiêu học tập và nhắc nhở hàng ngày."
        actions={
          <Button size="lg" onClick={() => handleSaveSection('study')} disabled={saving !== null}>
            {saving === 'study' ? <span className="mr-2 scale-50"><Loader size="sm" /></span> : <Save className="mr-2 h-4 w-4" />}
            Lưu
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dailyGoal">Mục tiêu mỗi ngày (phút)</Label>
            <Input
              id="dailyGoal"
              type="number"
              min={10}
              max={240}
              value={study.dailyGoalMinutes ?? 45}
              onChange={(event) =>
                updateSettingsState({
                  study: { dailyGoalMinutes: Number(event.target.value) || 0 },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Giờ nhắc nhở</Label>
            <Input
              id="reminderTime"
              type="time"
              value={study.reminderTime ?? defaultUserSettings.study.reminderTime}
              onChange={(event) =>
                updateSettingsState({ study: { reminderTime: event.target.value } })
              }
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-lg border border-dashed border-border/50 p-4">
            <div>
              <p className="font-medium">Tự động thêm sự kiện mới vào lịch</p>
              <p className="text-sm text-muted-foreground">
                Khi bạn tạo nhiệm vụ, SmartLearn sẽ giúp bạn lập lịch nhắc nhở tương ứng.
              </p>
            </div>
            <Switch
              checked={!!study.autoAddEvents}
              onCheckedChange={(checked) => updateSettingsState({ study: { autoAddEvents: checked } })}
            />
          </div>
        </div>
      </PageSection>

      <PageSection
        heading="Giao diện"
        description="Tùy chỉnh giao diện ứng dụng. Thay đổi có hiệu lực ngay lập tức."
      >
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label>Chủ đề</Label>
            <Select
              value={theme ?? 'system'}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chủ đề" />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Thay đổi chủ đề sẽ được áp dụng ngay lập tức cho toàn bộ ứng dụng.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-border/50 p-4">
            <div>
              <p className="font-medium">Hiệu ứng chúc mừng khi hoàn thành mục tiêu</p>
              <p className="text-sm text-muted-foreground">Giữ lại niềm vui chiến thắng bằng hiệu ứng confetti.</p>
            </div>
            <Switch
              checked={!!appearance.showConfetti}
              onCheckedChange={(checked) => updateSettingsState({ appearance: { showConfetti: checked } })}
            />
          </div>
        </div>
      </PageSection>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader size="sm" />
          <span>Đang tải cài đặt...</span>
        </div>
      ) : null}
    </div>
  );
}
