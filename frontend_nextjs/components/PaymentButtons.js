import { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/router';
import {
  DevicePhoneMobileIcon,
  KeyIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

function usePaymentForm(initialData) {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || "",
    c2pPhone: initialData?.c2pPhone || "",
    purchaseKey: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validateField = useCallback((name, value) => {
    let error = "";
    switch (name) {
      case 'c2pPhone':
        // Asegurarse de que el número siempre tenga el prefijo 58 y 10 dígitos después
        if (!/^58\d{10}$/.test(value)) {
          error = "Debe tener el formato 58XXXXXXXXXX (12 dígitos).";
        }
        break;
      case 'purchaseKey':
        if (!/^\d{4,8}$/.test(value)) {
          error = "Debe ser una clave numérica de 4 a 8 dígitos.";
        }
        break;
      case 'amount':
        if (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) <= 0) {
          error = "Debe ser un número positivo (ej: 150.50).";
        }
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  }, [validateField]);

  const isFormInvalid =
    Object.values(formErrors).some(e => e) ||
    Object.values(formData).some(v => v === "");

  return { formData, formErrors, isFormInvalid, handleInputChange, setFormData };
}

export default function PaymentButtons({ origin, checkoutData, personalData }) { // Aceptar personalData
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });
  const {
    formData,
    formErrors,
    isFormInvalid,
    handleInputChange,
    setFormData
  } = usePaymentForm({
    amount: personalData?.amount,
    c2pPhone: personalData?.phoneNumber ? `58${personalData.phoneNumber}` : ""
  });
  const [showKeyHelp, setShowKeyHelp] = useState(false);

  useEffect(() => {
    if (personalData) {
      setFormData(prev => ({
        ...prev,
        amount: personalData.amount || "",
        c2pPhone: personalData.phoneNumber ? `58${personalData.phoneNumber}` : ""
      }));
    }
  }, [personalData, setFormData]);

  const handleC2pPayment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: "", type: "" });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/create-c2p-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Incluir checkoutData y personalData en el cuerpo de la petición
        body: JSON.stringify({ ...formData, origin, checkoutData, personalData }),
      });
      const data = await res.json();

      if (!res.ok || data.status !== 'success') {
        throw new Error(data.error || "Error al procesar el pago.");
      }

      const { transactionId } = data;
      if (transactionId) {
        // Limpiar el localStorage después de un pago exitoso
        localStorage.removeItem('checkoutData');
        localStorage.removeItem('personalData'); // Limpiar también los datos personales
        router.push(`/compra-final/${transactionId}`); // Redirigir a la nueva página de recibo
      } else {
        throw new Error("No se recibió un ID de transacción para generar el recibo.");
      }

    } catch (err) {
      setStatus({ message: err.message, type: "error" });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        <DevicePhoneMobileIcon className="h-8 w-8 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Pago Móvil C2P</h2>
      </div>
      <div>
        {status.message && (
          <div
            className={`p-4 mb-4 rounded-md text-center text-sm font-medium transition-all duration-300 ${
              status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleC2pPayment} className="space-y-4" noValidate>
          <InputField label="Monto a pagar (Bs.)" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="150.00" error={formErrors.amount} icon={<CurrencyDollarIcon />} />
          <InputField label="Teléfono origen" name="c2pPhone" value={formData.c2pPhone} onChange={handleInputChange} placeholder="584142591177" error={formErrors.c2pPhone} icon={<DevicePhoneMobileIcon />} />
          <div className="relative">
            <InputField 
              label="Clave de compra" 
              name="purchaseKey" 
              value={formData.purchaseKey} 
              onChange={handleInputChange} 
              placeholder="••••" 
              error={formErrors.purchaseKey} 
              icon={<KeyIcon />} 
              type="password" 
              helpIcon={<QuestionMarkCircleIcon onClick={() => setShowKeyHelp(!showKeyHelp)} className="h-4 w-4 text-gray-400 hover:text-blue-600 cursor-pointer" />}
            />
            {showKeyHelp && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg">
                Para autorizar el pago, genera una <strong>Clave de Compra C2P</strong> temporal desde tu App Mercantil (Pago Móvil) o Mercantil en Línea e ingrésala aquí.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || isFormInvalid || !personalData}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : <DevicePhoneMobileIcon className="h-5 w-5" />}
            <span>{isLoading ? "Procesando..." : "Realizar Pago Móvil"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, placeholder, error, icon, type = "text", helpIcon = null }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {helpIcon && (
        <span className="ml-2">{helpIcon}</span>
      )}
    </div>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <div className="h-5 w-5 text-gray-400">{icon}</div>
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className={`block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset transition-all duration-200
          ${error
            ? 'ring-red-500 focus:ring-red-600'
            : 'ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600'
          }`}
      />
    </div>
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

const Spinner = () => (
  <ArrowPathIcon className="h-5 w-5 animate-spin" />
);