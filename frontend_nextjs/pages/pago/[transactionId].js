import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  CheckCircleIcon,
  PrinterIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

// --- Componente Principal de la Página de Recibo ---
export default function PaymentReceiptPage() {
  const router = useRouter();
  const { transactionId } = router.query; // Obtiene el ID de la URL

  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return; // No hacer nada si el ID no está disponible aún

    const fetchTransactionDetails = async () => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/payment-details/${transactionId}`);

        if (res.status === 404) {
          throw new Error('Transacción no encontrada. Por favor, verifica el enlace.');
        }
        if (!res.ok) {
          throw new Error('No se pudieron obtener los detalles del pago.');
        }

        const data = await res.json();
        setTransaction(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  // --- Handlers para los botones ---
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Recibo de Pago - Mercantil',
      text: `Comprobante de pago por ${transaction?.requestData?.amount || 'monto no disponible'}. Referencia del banco: ${transaction?.bankResponse?.reference || 'N/A'}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback para navegadores que no soportan la Web Share API
        navigator.clipboard.writeText(window.location.href);
        alert('¡Enlace del recibo copiado al portapapeles!');
      }
    } catch (err) {
      console.error('Error al compartir:', err);
      alert('No se pudo compartir el recibo.');
    }
  };

  // --- Renderizado condicional ---
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!transaction) {
    return <ErrorState message="No hay datos de la transacción para mostrar." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8 print:shadow-none">
        
        {/* Encabezado del Recibo */}
        <div className="text-center mb-6">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">Pago Exitoso</h1>
          <p className="text-gray-500 text-sm mt-1">Gracias por su compra.</p>
        </div>

        {/* Detalles de la Transacción */}
        <div className="space-y-4 border-t border-b border-gray-200 py-6">
          <DetailRow label="Monto Pagado" value={`${transaction.requestData.amount} VES`} />
          <DetailRow label="Teléfono Origen" value={transaction.requestData.c2pPhone} />
          <DetailRow label="Referencia del Banco" value={transaction.bankResponse.reference || 'No disponible'} />
          <DetailRow label="Fecha de Pago" value={new Date().toLocaleString('es-VE')} />
          <DetailRow label="ID de Transacción" value={transaction.internalId} isMono />
        </div>

        {/* Botones de Acción (no se imprimen) */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 print:hidden">
          <ActionButton onClick={handlePrint} icon={<PrinterIcon />} text="Imprimir Recibo" primary />
          <ActionButton onClick={handleShare} icon={<ShareIcon />} text="Compartir" />
        </div>

      </div>
    </div>
  );
}

// --- Subcomponentes para un código más limpio ---

const DetailRow = ({ label, value, isMono = false }) => (
  <div className="flex justify-between items-center">
    <p className="text-sm font-medium text-gray-600">{label}:</p>
    <p className={`${isMono ? 'font-mono text-xs' : 'font-semibold'} text-gray-800 text-right`}>{value}</p>
  </div>
);

const ActionButton = ({ onClick, icon, text, primary = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex justify-center items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors shadow-sm disabled:bg-gray-400 ${primary ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
    <div className="h-5 w-5">{icon}</div>
    <span>{text}</span>
  </button>
);

const LoadingState = () => (
  <div className="text-center p-8">
    <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
    <p className="mt-4 text-gray-600">Cargando detalles del pago...</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="text-center p-8">
    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
    <p className="mt-4 font-semibold text-red-700">Error</p>
    <p className="text-gray-600">{message}</p>
  </div>
);
