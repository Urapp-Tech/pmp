/* eslint-disable no-console */
import { useRoutes } from 'react-router-dom';
import { routeObjects } from './routes';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import monitorIdleTime from './utils/idle';
import systemConfigService from '@/services/adminapp/admin';
import { useDispatch } from 'react-redux';
import { setSystemConfig } from './redux/features/authSlice';
import { getItem } from './utils/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

dayjs.extend(duration);

function App() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const systemConfig = getItem('SYSTEM_CONFIG');

  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: {
        backgroundColor: '#FF5733',
        color: 'white',
      },
    });
  };
  // if (
  //   process.env.NODE_ENV === 'production' ||
  //   process.env.NODE_ENV === 'staging'
  // ) {
  //   console.log = () => {};
  //   console.error = () => {};
  //   console.warn = () => {};
  // }

  useEffect(() => {
    const intervalTime = dayjs.duration(5, 'minutes').asMilliseconds();
    const idleTime = dayjs.duration(15, 'minutes').asMilliseconds();
    monitorIdleTime(intervalTime, idleTime, () => {
      localStorage.clear();
      window.location.replace('/admin');
    });
  }, []);

  // useEffect(() => {
  //   if (systemConfig) return;
  //   systemConfigService
  //     .systemConfig(window.location.hostname)
  //     .then((res: any) => {
  //       if (res.data.success) {
  //         dispatch(setSystemConfig(res.data.data));
  //       } else {
  //         ToastHandler('fetching system config failed');
  //       }
  //     })
  //     .catch(() => {
  //       ToastHandler('fetching system config failed');
  //       // setIsPageLoader(false);
  //       // navigate('./admin/auth/404', { replace: true });
  //       // showBoundary(new Error('fetching system config failed'));
  //       // showNotification(err.message, 'error');
  //     });
  // }, []);

  const routes = useRoutes(routeObjects);
  return routes;
}

export default App;
