import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Save, Loader2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Separator } from '@/shared/components/ui/separator';
import {
  userRepository,
  defaultUserSettings,
  mergeUserSettings,
  type UserSettings,
  type UserSettingsUpdate,
} from '@/shared/lib/repositories/UserRepository';
import { useAuth } from '@/shared/hooks/useAuthRedux';

type SettingsSectionKey = keyof Required<UserSettings>;

const languageOptions = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];

const timezoneFallbacks = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
];

const visibilityOptions: Array<{ value: Required<UserSettings>['privacy']['profileVisibility']; label: string }> = [
  { value: 'public', label: 'Công khai' },
  { value: 'friends', label: 'Chia sẻ với bạn bè' },
  { value: 'private', label: 'Chỉ mình tôi' },
];

const themeOptions: Array<{ value: Required<UserSettings>['appearance']['theme']; label: string }> = [
  { value: 'system', label: 'Theo hệ thống' },
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' },
];

const densityOptions: Array<{ value: Required<UserSettings>['appearance']['density']; label: string }> = [
  { value: 'comfortable', label: 'Thoải mái' },
  { value: 'compact', label: 'Gọn gàng' },
  { value: 'spacious', label: 'Rộng rãi' },
];

export default function SettingsPage() {
  const { user } = useAuth();
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

  const timezoneOptions = useMemo(() => {
    if (typeof Intl.supportedValuesOf === 'function') {
      const zones = Intl.supportedValuesOf('timeZone');
      if (Array.isArray(zones) && zones.length > 0) {
        return zones;
      }
    }
    return timezoneFallbacks;
  }, []);

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
        toast.success('Đã lưu cài đặt thành công.');
      } catch (error) {
        console.error('Failed to save settings section', error);
        toast.error('Không thể lưu cài đặt. Vui lòng thử lại.');
      } finally {
        setSaving(null);
      }
    },
    [settings],
  );

  const handleResetSection = useCallback(
    async (section: SettingsSectionKey) => {
      const defaults = section === 'profile' ? baseline.profile : defaultUserSettings[section];
      if (!defaults) return;
      const payload: UserSettingsUpdate = {
        [section]: defaults,
      } as UserSettingsUpdate;
      updateSettingsState(payload);
      setSaving(section);
      try {
        const updated = await userRepository.updateUserSettings(payload);
        setSettings(updated);
        toast.success('Đã khôi phục cài đặt mặc định.');
      } catch (error) {
        console.error('Failed to reset section', error);
        toast.error('Không thể khôi phục cài đặt.');
      } finally {
        setSaving(null);
      }
    },
    [baseline.profile, updateSettingsState],
  );

  const handleResetAll = useCallback(async () => {
    const resetValues = mergeUserSettings(baseline, defaultUserSettings);
    setSaving('all');
    updateSettingsState(resetValues);
    try {
      const updated = await userRepository.updateUserSettings(resetValues);
      setSettings(updated);
      toast.success('Đã khôi phục toàn bộ cài đặt.');
    } catch (error) {
      console.error('Failed to reset all settings', error);
      toast.error('Không thể khôi phục toàn bộ cài đặt.');
    } finally {
      setSaving(null);
    }
  }, [baseline, updateSettingsState]);

  const profile = settings.profile || defaultUserSettings.profile;
  const notifications = settings.notifications || defaultUserSettings.notifications;
  const study = settings.study || defaultUserSettings.study;
  const appearance = settings.appearance || defaultUserSettings.appearance;
  const privacy = settings.privacy || defaultUserSettings.privacy;

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Cài đặt tài khoản"
        description="Tùy chỉnh trải nghiệm học tập, thông báo và quyền riêng tư của bạn trên SmartLearn."
        icon={<Settings2 className="h-6 w-6 text-primary" />}
        actions={
          <Button
            variant="outline"
            onClick={handleResetAll}
            disabled={saving !== null}
          >
            {saving === 'all' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
            Khôi phục mặc định
          </Button>
        }
      />

      <PageSection
        heading="Thông tin cá nhân"
        description="Cập nhật những thông tin giúp hồ sơ của bạn rõ ràng và dễ kết nối hơn."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleResetSection('profile')}
              disabled={saving !== null}
            >
              {saving === 'profile' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Đặt lại
            </Button>
            <Button onClick={() => handleSaveSection('profile')} disabled={saving !== null}>
              {saving === 'profile' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="language">Ngôn ngữ</Label>
            <Select
              value={profile.language ?? defaultUserSettings.profile.language}
              onValueChange={(value) => updateSettingsState({ profile: { language: value } })}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Chọn ngôn ngữ" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Múi giờ</Label>
            <Select
              value={profile.timezone ?? defaultUserSettings.profile.timezone}
              onValueChange={(value) => updateSettingsState({ profile: { timezone: value } })}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Chọn múi giờ" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {timezoneOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        heading="Thông báo"
        description="Quản lý cách SmartLearn thông báo cho bạn về hoạt động học tập."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleResetSection('notifications')}
              disabled={saving !== null}
            >
              {saving === 'notifications' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Đặt lại
            </Button>
            <Button onClick={() => handleSaveSection('notifications')} disabled={saving !== null}>
              {saving === 'notifications' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Thông báo email</p>
              <p className="text-sm text-muted-foreground">Nhận email khi có hoạt động quan trọng.</p>
            </div>
            <Switch
              checked={!!notifications.emailNotifications}
              onCheckedChange={(checked) =>
                updateSettingsState({ notifications: { emailNotifications: checked } })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Thông báo đẩy</p>
              <p className="text-sm text-muted-foreground">Nhận thông báo ngay trên thiết bị của bạn.</p>
            </div>
            <Switch
              checked={!!notifications.pushNotifications}
              onCheckedChange={(checked) =>
                updateSettingsState({ notifications: { pushNotifications: checked } })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Nhắc nhở học tập</p>
              <p className="text-sm text-muted-foreground">Gửi lời nhắc trước giờ học theo lịch cá nhân.</p>
            </div>
            <Switch
              checked={!!notifications.studyReminders}
              onCheckedChange={(checked) =>
                updateSettingsState({ notifications: { studyReminders: checked } })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Báo cáo tổng kết tuần</p>
              <p className="text-sm text-muted-foreground">Gửi thống kê ngắn gọn về tiến độ mỗi tuần.</p>
            </div>
            <Switch
              checked={!!notifications.weeklySummary}
              onCheckedChange={(checked) =>
                updateSettingsState({ notifications: { weeklySummary: checked } })
              }
            />
          </div>
        </div>
      </PageSection>

      <PageSection
        heading="Thói quen học tập"
        description="Điều chỉnh mục tiêu và cách SmartLearn hỗ trợ bạn mỗi ngày."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleResetSection('study')}
              disabled={saving !== null}
            >
              {saving === 'study' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Đặt lại
            </Button>
            <Button onClick={() => handleSaveSection('study')} disabled={saving !== null}>
              {saving === 'study' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </div>
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
        description="Chọn cách hiển thị phù hợp với phong cách học tập của bạn."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleResetSection('appearance')}
              disabled={saving !== null}
            >
              {saving === 'appearance' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Đặt lại
            </Button>
            <Button onClick={() => handleSaveSection('appearance')} disabled={saving !== null}>
              {saving === 'appearance' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Chủ đề</Label>
            <Select
              value={appearance.theme ?? defaultUserSettings.appearance.theme}
              onValueChange={(value) => updateSettingsState({ appearance: { theme: value as typeof appearance.theme } })}
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
          </div>
          <div className="space-y-2">
            <Label>Mật độ hiển thị</Label>
            <Select
              value={appearance.density ?? defaultUserSettings.appearance.density}
              onValueChange={(value) => updateSettingsState({ appearance: { density: value as typeof appearance.density } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn mật độ" />
              </SelectTrigger>
              <SelectContent>
                {densityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-lg border border-dashed border-border/50 p-4">
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

      <PageSection
        heading="Quyền riêng tư"
        description="Kiểm soát những gì người khác có thể thấy về hoạt động học tập của bạn."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleResetSection('privacy')}
              disabled={saving !== null}
            >
              {saving === 'privacy' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Đặt lại
            </Button>
            <Button onClick={() => handleSaveSection('privacy')} disabled={saving !== null}>
              {saving === 'privacy' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ai có thể xem hồ sơ của bạn?</Label>
            <Select
              value={privacy.profileVisibility ?? defaultUserSettings.privacy.profileVisibility}
              onValueChange={(value) =>
                updateSettingsState({
                  privacy: { profileVisibility: value as typeof privacy.profileVisibility },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quyền riêng tư" />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Chia sẻ hoạt động học tập</p>
              <p className="text-sm text-muted-foreground">Hiển thị tiến độ cho bạn bè cùng học.</p>
            </div>
            <Switch
              checked={!!privacy.shareActivity}
              onCheckedChange={(checked) => updateSettingsState({ privacy: { shareActivity: checked } })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Cho phép sử dụng dữ liệu ẩn danh</p>
              <p className="text-sm text-muted-foreground">Giúp SmartLearn cải thiện tính năng bằng dữ liệu thống kê ẩn danh.</p>
            </div>
            <Switch
              checked={!!privacy.dataInsights}
              onCheckedChange={(checked) => updateSettingsState({ privacy: { dataInsights: checked } })}
            />
          </div>
        </div>
      </PageSection>

      {loading ? (
        <div className="text-sm text-muted-foreground">Đang tải cài đặt của bạn...</div>
      ) : null}
    </div>
  );
}
