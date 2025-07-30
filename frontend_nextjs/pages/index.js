import Head from "next/head";
import PaymentButtons from "../components/PaymentButtons";

export default function Home() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Pasarela de Pago</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Pasarela de Pago
            </h1>
          </div>
          <PaymentButtons />
        </div>
      </main>
    </>
  );
}