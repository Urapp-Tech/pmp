import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  Pencil,
  CircleDollarSign,
  ExternalLink,
} from 'lucide-react';
import { getItem } from '@/utils/storage';
import { ASSET_BASE_URL } from '@/utils/constants';
import service from '@/services/adminapp/admin';
import serviceUser from '@/services/adminapp/users';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { login } from '@/redux/features/authSlice';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/redux/redux-hooks';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import ProfileModal from '@/components/Profile/ProfileModal';
// import { toast } from '@/hooks/use-toast';
// import { useDispatch } from 'react-redux';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const user: any = getItem('USER');
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // const dispatch = useDispatch();
  const landlordId = user?.landlordId;
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [actionId, setActionId] = useState<string | null>(null); // disable buttons while processing

  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: '#5CB85C',
        color: 'white',
        zIndex: 9999,
      },
    });
  };

  const fetchProfile = async () => {
    if (!landlordId) return;
    setLoading(true);
    try {
      const res = await service.getLandlordProfile(landlordId, {
        historyPage: 1,
        historySize: 10,
      });

      if (res?.data?.success) {
        const data = res.data.data;
        setProfile(data);

        // ---- update allowedHoldingProperties if we see a PAID history row ----
        const items: any[] = Array.isArray(data?.history?.items)
          ? data.history.items.slice()
          : [];

        // ensure newest-first (backend already orders desc, this is just defensive)
        items.sort(
          (a, b) =>
            new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
        );

        // find the latest PAID row with a valid holdingProperties
        const latestPaid = items.find(
          (it) =>
            String(it?.status || '').toUpperCase() === 'PAID' &&
            it?.holdingProperties != null
        );

        if (latestPaid) {
          const hp = Number(latestPaid.holdingProperties) || 0;

          // only update if different from what we have stored
          const currentHP = Number(user?.allowedHoldingProperties ?? 0);
          if (hp !== currentHP) {
            const updatedUser = { ...user, allowedHoldingProperties: hp };
            // This will also setItem('USER', updatedUser) via your reducer
            dispatch(login(updatedUser));
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [landlordId]);

  // cancel API
  const cancelSubscription = async (recordId: string) => {
    const ok = window.confirm(
      'Are you sure you want to cancel this subscription?'
    );
    if (!ok) return;
    setActionId(recordId);
    try {
      if (typeof (service as any).cancelSubscribedLandlord === 'function') {
        await service.cancelSubscribedLandlord(recordId, {
          reason: 'User requested cancellation',
        });
      } else {
        throw new Error(
          'Add cancelSubscribedLandlord() or .post() to your service'
        );
      }
      ToastHandler('Subscription cancelled successfully');
      await fetchProfile();
      // optional: toast success
    } catch (e: any) {
      console.error(e);
      ToastHandler('Failed to cancel subscription');
      // window.alert(
      //   e?.response?.data?.detail || 'Failed to cancel subscription'
      // );
    } finally {
      setActionId(null);
    }
  };

  const subscriptions = profile?.subscriptions || [];
  const anyActive = useMemo(
    () => subscriptions.some((s: any) => !!s.isSubscribed),
    [subscriptions]
  );

  return user.role.name === 'Landlord' ? (
    <>
      <ProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initial={{
          // prefer profile values, fallback to user
          id: profile?.id ?? user?.id,
          fname: profile?.fname ?? user?.fname,
          lname: profile?.lname ?? user?.lname,
          email: profile?.email ?? user?.email,
          phone: profile?.phone ?? user?.phone,
          gender: profile?.gender ?? user?.gender,
          profilePic:
            profile?.profilePic ??
            profile?.profile_pic ??
            user?.profilePic ??
            '',
        }}
        saving={saving}
        onSave={async (payload) => {
          try {
            setSaving(true);
            // TODO: call your API here, e.g.:
            const res = await serviceUser.updateProfile(payload);
            const userData = res.data.items;
            dispatch(login({...user, fname: userData.fname, lname: userData.lname, profilePic: userData.profilePic, phone: userData.phone, gender: userData.gender}));

            toast({
              description: 'Profile updated successfully.',
              className: cn(
                'top-0 right-0 fixed md:max-w-[420px] md:top-4 md:right-4'
              ),
              style: { backgroundColor: '#5CB85C', color: 'white' },
            });
            setEditOpen(false);
          } catch (e) {
            toast({
              description: 'Failed to update profile.',
              className: cn(
                'top-0 right-0 fixed md:max-w-[420px] md:top-4 md:right-4'
              ),
              style: { backgroundColor: '#D9534F', color: 'white' },
            });
          } finally {
            setSaving(false);
          }
        }}
      />
      <div className="m-5 bg-gradient-to-br flex flex-col items-center justify-center mt-3">
        <Card className="w-full rounded-3xl shadow-2xl border border-scrollbar">
          <CardContent className="p-6 flex flex-col items-center text-center">
            {/* Profile Picture */}
            <div className="relative mb-6">
              <img
                src={
                  user?.profilePic
                    ? ASSET_BASE_URL + user?.profilePic
                    : 'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(
                        (profile?.name || `${user?.fname} ${user?.lname}`) ?? ''
                      ) +
                      '&background=random'
                }
                alt="Profile"
                className="w-40 h-40 rounded-full border-4 border-primary-bg object-cover shadow-lg"
              />
              {user?.isVerified && (
                <CheckCircle className="w-7 h-7 text-green-500 absolute bottom-2 right-2" />
              )}
            </div>
            {/* Name & badges */}
            <h1 className="capitalize text-3xl font-semibold text-primary-bg">
              {profile?.name ?? `${user?.fname} ${user?.lname}`}
            </h1>
            <p className="text-gray-500 text-lg mt-1">
              {profile?.email ?? user?.email}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap justify-center">
              {user?.role && (
                <Badge className="bg-primary-bg text-white px-3 py-1 text-sm rounded-full hover:!bg-primary-bg">
                  {user.role.name}
                </Badge>
              )}
              {user?.isVerified && (
                <Badge className="bg-green-500 text-white px-3 py-1 text-sm rounded-full hover:!bg-green-500">
                  Verified
                </Badge>
              )}

              <Button
                variant="outline"
                className="rounded-full h-9 px-4"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* Metadata */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
              <div className="bg-secondary-bg rounded-xl p-4 shadow-inner">
                <p className="text-primary-bg text-sm">Account Status</p>
                <p className="font-medium text-lg">
                  {user?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="bg-secondary-bg rounded-xl p-4 shadow-inner">
                <p className="text-primary-bg text-sm">Gender</p>
                <p className="font-medium text-lg capitalize">
                  {profile?.gender ?? user?.gender ?? '-'}
                </p>
              </div>
              <div className="bg-secondary-bg rounded-xl p-4 shadow-inner">
                <p className="text-primary-bg text-sm">Phone</p>
                <p className="font-medium text-lg">
                  {profile?.phone ?? user?.phone ?? '-'}
                </p>
              </div>
            </div>

            {/* Subscriptions Accordion */}
            <div className="w-full mt-10 text-left">
              <h2 className="text-xl font-semibold text-primary-bg mb-3">
                Your Subscriptions
              </h2>

              {subscriptions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-scrollbar p-8 text-center text-gray-500">
                  No subscriptions yet.
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-4">
                  {subscriptions
                    .slice()
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.createdAt).valueOf() -
                        new Date(a.createdAt).valueOf()
                    )
                    .map((s: any) => {
                      const sStatus = String(s.status || '').toLowerCase();
                      const expires = s.expirationDate
                        ? dayjs(s.expirationDate).format('DD MMM YYYY')
                        : '-';
                      const dueRaw = s.dueAmount ?? s.totalAmount ?? '0.000';
                      const due = Number.parseFloat(
                        String(dueRaw || '0')
                      ).toFixed(3);
                      const showPay =
                        sStatus === 'approved' &&
                        !!s.paymentLink &&
                        !!s.showPayNow; // backend decides timing
                      const canCancel =
                        sStatus !== 'rejected' && sStatus !== 'cancelled';

                      const statusTone =
                        sStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : sStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : sStatus === 'cancelled'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-rose-50 text-rose-700';

                      return (
                        <AccordionItem
                          key={s.id}
                          value={s.id}
                          className="rounded-2xl border border-scrollbar overflow-hidden"
                        >
                          <AccordionTrigger className="px-5 py-4 hover:no-underline">
                            <div className="w-full flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] shadow">
                                  <CircleDollarSign className="text-white" />
                                </div>
                                <div>
                                  <div className="text-lg font-semibold text-primary-bg">
                                    {s.planName}{' '}
                                    <span className="text-gray-400">
                                      • {s.holdingProperties} properties
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Due:{' '}
                                    <span className="font-medium text-primary-bg">
                                      {due} KWD
                                    </span>
                                    {'  '}•{'  '}
                                    Expires:{' '}
                                    <span className="font-medium">
                                      {expires}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusTone}`}
                                >
                                  {s.status}
                                </span>
                                {!!s.daysToExpiry &&
                                  sStatus !== 'cancelled' && (
                                    <div className="hidden sm:flex items-center text-xs text-gray-500">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {s.daysToExpiry} days left
                                    </div>
                                  )}
                              </div>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="px-5 pb-5">
                            <div className="rounded-2xl overflow-hidden">
                              <div className="bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] p-5 text-white">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="text-xl font-semibold">
                                      {s.planName}
                                    </div>
                                    <div className="text-sm opacity-80">
                                      {s.holdingProperties} allowed properties
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-3xl font-semibold leading-tight">
                                      {Number(s.totalAmount || 0).toFixed(3)}{' '}
                                      KWD
                                    </div>
                                    {s.discountedAmount &&
                                      Number(s.discountedAmount) > 0 && (
                                        <div className="text-sm opacity-80">
                                          Discount:{' '}
                                          {Number(s.discountedAmount).toFixed(
                                            3
                                          )}{' '}
                                          KWD
                                        </div>
                                      )}
                                    <div className="text-sm">
                                      Grand Total:{' '}
                                      <span className="font-semibold">
                                        {due} KWD
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions row */}
                                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                                  {showPay && (
                                    <a
                                      className="inline-flex items-center gap-1"
                                      href={s.paymentLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button
                                        className="hover:bg-scrollbar bg-white/10 text-white"
                                        variant="outline"
                                      >
                                        Pay Now
                                        <ExternalLink className="ml-1 h-4 w-4" />
                                      </Button>
                                    </a>
                                  )}

                                  {canCancel && (
                                    <Button
                                      variant="destructive"
                                      className="hover:bg-scrollbar bg-scrollbar text-white"
                                      disabled={actionId === s.id}
                                      onClick={() => cancelSubscription(s.id)}
                                    >
                                      {actionId === s.id
                                        ? 'Cancelling…'
                                        : 'Cancel subscription'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                </Accordion>
              )}
            </div>

            {/* Subscription Payment History */}
            <div className="w-full mt-10">
              <h2 className="text-left text-xl font-semibold text-primary-bg mb-3">
                Subscription Payment History
              </h2>
              <div className="overflow-x-auto rounded-xl border border-scrollbar">
                <table className="min-w-full text-left">
                  <thead className="bg-bodyTable">
                    <tr className="text-primary-bg">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Properties</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Currency</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {profile?.history?.items?.length ? (
                      profile.history.items.map((it: any) => (
                        <tr key={it.id}>
                          <td className="px-4 py-3">
                            {dayjs(it.createdAt).format('DD MMM YYYY')}
                          </td>
                          <td className="px-4 py-3">{it.subsName || '-'}</td>
                          <td className="px-4 py-3">
                            {it.holdingProperties ?? '-'}
                          </td>
                          <td className="px-4 py-3">
                            {it.amount?.toFixed?.(3) ??
                              Number(it.amount || 0).toFixed(3)}
                          </td>
                          <td className="px-4 py-3">{it.currency || 'KWD'}</td>
                          <td className="px-4 py-3 capitalize">
                            {String(it.status).toLowerCase()}
                          </td>
                          <td className="px-4 py-3">
                            {it.paymentUrl && it.status === 'PENDING' ? (
                              <a
                                className="text-primary-bg underline"
                                href={it.paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  className="ml-auto w-[100px] hover:bg-scrollbar h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                                  variant={'outline'}
                                >
                                  Pay Now
                                </Button>
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-6 text-gray-500" colSpan={7}>
                          No subscription payments yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {loading && (
              <div className="mt-6 text-gray-500">Loading profile…</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  ) : (
    <div className="bg-gradient-to-br flex flex-col items-center justify-center mt-3">
      <ProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initial={{
          // prefer profile values, fallback to user
          id: profile?.id ?? user?.id,
          fname: profile?.fname ?? user?.fname,
          lname: profile?.lname ?? user?.lname,
          email: profile?.email ?? user?.email,
          phone: profile?.phone ?? user?.phone,
          gender: profile?.gender ?? user?.gender,
          profilePic:
            profile?.profilePic ??
            profile?.profile_pic ??
            user?.profilePic ??
            '',
        }}
        saving={saving}
        onSave={async (payload) => {
          try {
            setSaving(true);
            // TODO: call your API here, e.g.:
            // const res = await service.updateMyProfile(payload);
            // setProfile(res.data ?? payload);

            const res = await serviceUser.updateProfile(payload);
            const userData = res.data.items;
            dispatch(login({...user, fname: userData.fname, lname: userData.lname, profilePic: userData.profilePic, phone: userData.phone, gender: userData.gender}));

            toast({
              description: 'Profile updated successfully.',
              className: cn(
                'top-0 right-0 fixed md:max-w-[420px] md:top-4 md:right-4'
              ),
              style: { backgroundColor: '#5CB85C', color: 'white' },
            });
            setEditOpen(false);
          } catch (e) {
            toast({
              description: 'Failed to update profile.',
              className: cn(
                'top-0 right-0 fixed md:max-w-[420px] md:top-4 md:right-4'
              ),
              style: { backgroundColor: '#D9534F', color: 'white' },
            });
          } finally {
            setSaving(false);
          }
        }}
      />
      <Card className="w-full max-w-3xl rounded-3xl shadow-2xl border border-scrollbar">
        <CardContent className="p-6 flex flex-col items-center text-center">
          {/* fallback view for non-landlord (unchanged) */}
          <div className="relative mb-6">
            <img
              src={
                user.profilePic
                  ? ASSET_BASE_URL + user?.profilePic
                  : 'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(user.fname + ' ' + user.lname) +
                    '&background=random'
              }
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-primary-bg object-cover shadow-lg"
            />
            {user.isVerified && (
              <CheckCircle className="w-7 h-7 text-green-500 absolute bottom-2 right-2" />
            )}
          </div>

          <h1 className="capitalize text-3xl font-semibold text-primary-bg">
            {user.fname} {user.lname}
          </h1>
          <p className="text-gray-500 text-lg mt-1">{user.email}</p>
          <div className="flex gap-2 mt-3">
            {user.role && (
              <Badge className="bg-primary-bg text-white px-3 py-1 text-sm rounded-full">
                {user.role.name}
              </Badge>
            )}

            {user.isVerified && (
              <Badge className="bg-green-600 text-white px-3 py-1 text-sm rounded-full">
                Verified
              </Badge>
            )}

            <Button
              variant="outline"
              className="rounded-full h-9 px-4"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
            <div className="bg-secondary-bg rounded-xl p-4 shadow-inner">
              <p className="text-primary-bg text-sm">Account Status</p>
              <p className="font-medium text-lg">
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="bg-secondary-bg rounded-xl p-4 shadow-inner">
              <p className="text-primary-bg text-sm">Gender</p>
              <p className="font-medium text-lg capitalize">{user.gender}</p>
            </div>
            <div className="bg-secondary-bg rounded-xl p-4 shadow-inner">
              <p className="text-primary-bg text-sm">Phone</p>
              <p className="font-medium text-lg">{user.phone}</p>
            </div>
            <div className="bg-secondary-bg rounded-xl p-4 shadow-inner">
              <p className="text-primary-bg text-sm">Created At</p>
              <p className="font-medium text-lg">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return profile;
};

export default ProfilePage;
