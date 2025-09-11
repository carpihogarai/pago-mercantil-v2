import Head from "next/head";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PaymentButtons from "../components/PaymentButtons";

export default function PaymentPage() {
  const router = useRouter();
  const { origin } = router.query;
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    // Los datos del checkout se guardan en localStorage para persistir entre páginas.
    const savedData = localStorage.getItem('checkoutData');
    if (savedData) {
      setCheckoutData(JSON.parse(savedData));
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Realizar Pago</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Realizar Pago
            </h1>
          </div>
          {/* Pasar origin y checkoutData al componente de botones */}
          <PaymentButtons origin={origin} checkoutData={checkoutData} />
        </div>
      </main>
    </>
  );
}