import Head from "next/head";
import { useRouter } from 'next/router';
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export default function HomePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/chequeo');
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Bienvenido a Trends172 Pago</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Bienvenido a la Pasarela de Pagos de Trends172
          </h1>
          <p className="text-lg text-gray-600">
            Realiza tus pagos de forma rápida y segura.
          </p>
          <button
            onClick={handleStart}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-lg shadow-md"
          >
            <span>Comenzar Pago</span>
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </main>
    </>
  );
}