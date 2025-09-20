import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

export default function CompraFinalPage() {
  const router = useRouter();
  const { transactionId } = router.query;
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transactionId) {
      const fetchTransactionDetails = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
          const res = await fetch(`${apiUrl}/api/payment-details/${transactionId}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Error al obtener los detalles de la transacción.");
          }
          setTransactionDetails(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransactionDetails();
    }
  }, [transactionId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg text-gray-700">Cargando detalles de la transacción...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <XCircleIcon className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-700">Error: {error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  if (!transactionDetails) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <XCircleIcon className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-700">No se encontraron detalles para esta transacción.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const { internalId, status, requestData, bankResponse, personalData, created_at } = transactionDetails;
  const transactionDate = created_at ? new Date(created_at).toLocaleString() : 'N/A';

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Recibo de Pago</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-8">
            {status === 'completed' ? (
              <CheckCircleIcon className="h-16 w-16 text-green-600" />
            ) : (
              <XCircleIcon className="h-16 w-16 text-red-600" />
            )}
            <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900">
              {status === 'completed' ? '¡Pago Exitoso!' : 'Pago Fallido'}
            </h1>
            <p className="text-gray-600 text-lg">Gracias por tu compra.</p>
          </div>

          <div className="space-y-6">
            <Section title="Detalles de la Transacción">
              <DetailItem label="ID de Transacción Interno" value={internalId} />
              <DetailItem label="Estado" value={status.toUpperCase()} />
              <DetailItem label="Fecha y Hora" value={transactionDate} />
              <DetailItem label="Monto Pagado" value={`Bs. ${personalData?.amount || requestData?.amount || 'N/A'}`} />
            </Section>

            <Section title="Datos Personales">
              <DetailItem label="Nombre Completo" value={personalData?.fullName || 'N/A'} />
              <DetailItem label="Teléfono" value={personalData?.phoneNumber ? `58${personalData.phoneNumber}` : 'N/A'} />
              <DetailItem label="Cédula/RIF" value={personalData?.idNumber || 'N/A'} />
              <DetailItem label="Dirección Fiscal" value={personalData?.billingAddress || 'N/A'} />
              <DetailItem label="Dirección de Envío" value={personalData?.shippingAddress || 'N/A'} />
              <DetailItem label="Correo Electrónico" value={personalData?.email || 'N/A'} />
            </Section>

            <Section title="Respuesta del Banco">
              <DetailItem label="Código de Respuesta" value={bankResponse?.code || 'N/A'} />
              <DetailItem label="Mensaje del Banco" value={bankResponse?.message || bankResponse?.error || JSON.stringify(bankResponse) || 'N/A'} />
            </Section>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

const Section = ({ title, children }) => (
  <div className="border-t border-gray-200 pt-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      {children}
    </dl>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="sm:col-span-1">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-lg text-gray-900 break-words">{value}</dd>
  </div>
);