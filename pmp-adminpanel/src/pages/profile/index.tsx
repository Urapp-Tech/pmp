import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  ExternalLink,
  Clock,
  CircleDollarSign,
} from 'lucide-react';
import { getItem } from '@/utils/storage';
import { ASSET_BASE_URL } from '@/utils/constants';
import service from '@/services/adminapp/admin';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const ProfilePage = () => {
  const user: any = getItem('USER');
  const landlordId = user?.landlordId;
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async () => {
    if (!landlordId) return;
    setLoading(true);
    try {
      const res = await service.getLandlordProfile(landlordId, {
        historyPage: 1,
        historySize: 10,
      });
      if (res?.data?.success) {
        setProfile(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [landlordId]);

  const subscriptions = profile?.subscriptions || [];
  const anyActive = useMemo(
    () => subscriptions.some((s: any) => !!s.isSubscribed),
    [subscriptions]
  );

  return user.role.name === 'Landlord' ? (
    <>
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
                <Badge className="bg-primary-bg text-white px-3 py-1 text-sm rounded-full">
                  {user.role.name}
                </Badge>
              )}
              {user?.isVerified && (
                <Badge className="bg-green-600 text-white px-3 py-1 text-sm rounded-full">
                  Verified
                </Badge>
              )}
            </div>

            {/* Metadata (no subscription boxes here anymore) */}
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
                    .slice() // avoid mutating original
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.createdAt).valueOf() -
                        new Date(a.createdAt).valueOf()
                    )
                    .map((s: any) => {
                      const expires = s.expirationDate
                        ? dayjs(s.expirationDate).format('DD MMM YYYY')
                        : '-';
                      const due = s.dueAmount ?? s.totalAmount ?? '0.000';
                      const showPay = !!s.paymentLink && !!s.showPayNow;
                      const statusTone =
                        s.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : s.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
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
                                      • {s.holdingProperties} units
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
                                {!!s.daysToExpiry && (
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
                                      {s.totalAmount} KWD
                                    </div>
                                    {s.discountedAmount &&
                                      s.discountedAmount !== '0.000' && (
                                        <div className="text-sm opacity-80">
                                          Discount: {s.discountedAmount} KWD
                                        </div>
                                      )}
                                    <div className="text-sm">
                                      Grand Total:{' '}
                                      <span className="font-semibold">
                                        {s.dueAmount} KWD
                                      </span>
                                    </div>
                                  </div>
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
                        <tr key={it.id} className="">
                          <td className="px-4 py-3">
                            {dayjs(it.createdAt).format('DD MMM YYYY')}
                          </td>
                          <td className="px-4 py-3">{it.subsName || '-'}</td>
                          <td className="px-4 py-3">
                            {it.holdingProperties ?? '-'}
                          </td>
                          <td className="px-4 py-3">
                            {it.amount?.toFixed?.(3) ?? it.amount}
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
      <Card className="w-full max-w-3xl rounded-3xl shadow-2xl border border-scrollbar">
        <CardContent className="p-6 flex flex-col items-center text-center">
          {/* Profile Picture */}
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

          {/* Name & Verified Badge */}
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
          </div>

          {/* Metadata */}
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
};

export default ProfilePage;
