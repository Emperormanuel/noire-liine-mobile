import Link from 'next/link';

export default async function Success({ searchParams }) {
  const { id, email } = await searchParams;
  return (
    <div className="center">
      <div className="emoji">🎉</div>
      <h1>Order placed!</h1>
      <p>Your order number is <b>#{id?.slice(0, 8)}</b>.</p>
      <p className="muted">
        {email === '1' ? 'A confirmation email is on its way.' : "We couldn't send a confirmation email, but your order is saved."}
      </p>
      <Link href="/orders" className="btn">View my orders</Link>
    </div>
  );
}
