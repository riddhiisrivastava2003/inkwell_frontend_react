import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import newsletterService from '../../services/newsletterService';
import Loader from '../../components/common/Loader';

function NewsletterUnsubscribePage() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setLoading(false);
      return;
    }
    newsletterService.unsubscribe(token)
      .then(() => {
        setOk(true);
        toast.success('You have been unsubscribed');
      })
      .catch(() => {
        toast.error('Invalid unsubscribe link');
      })
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <Loader text="Processing unsubscribe..." />;

  return (
    <div className="container py-5 text-center">
      <h2>{ok ? 'Unsubscribed' : 'Unsubscribe Failed'}</h2>
      <p className="text-muted">{ok ? 'You will no longer receive newsletter emails.' : 'The link is invalid or expired.'}</p>
      <Link to="/" className="btn btn-primary rounded-pill px-4">Go Home</Link>
    </div>
  );
}

export default NewsletterUnsubscribePage;
