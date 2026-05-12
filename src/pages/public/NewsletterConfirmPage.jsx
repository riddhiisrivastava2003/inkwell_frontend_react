import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import newsletterService from '../../services/newsletterService';
import Loader from '../../components/common/Loader';

function NewsletterConfirmPage() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setLoading(false);
      return;
    }
    newsletterService.confirm(token)
      .then(() => {
        setOk(true);
        toast.success('Subscription confirmed');
      })
      .catch(() => {
        toast.error('Invalid or expired confirmation link');
      })
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <Loader text="Confirming subscription..." />;

  return (
    <div className="container py-5 text-center">
      <h2>{ok ? 'Subscription Confirmed' : 'Confirmation Failed'}</h2>
      <p className="text-muted">{ok ? 'You are now subscribed to InkWell newsletter.' : 'Please request a new confirmation link.'}</p>
      <Link to="/" className="btn btn-primary rounded-pill px-4">Go Home</Link>
    </div>
  );
}

export default NewsletterConfirmPage;
