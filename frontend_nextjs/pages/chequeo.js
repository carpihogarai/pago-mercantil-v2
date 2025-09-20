import Head from "next/head";
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect } from 'react';
import { UserIcon, PhoneIcon, IdentificationIcon, MapPinIcon, EnvelopeIcon, CurrencyDollarIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

function usePersonalDataForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    idNumber: "",
    billingAddress: "",
    shippingAddress: "",
    email: "",
    amount: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validateField = useCallback((name, value) => {
    let error = "";
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = "El nombre completo es obligatorio.";
        break;
      case 'phoneNumber':
        if (!/^\d{10}$/.test(value)) error = "Debe ser un número de teléfono de 10 dígitos (sin el 58).";
        break;
      case 'idNumber':
        if (!value.trim()) error = "La cédula o RIF es obligatorio.";
        break;
      case 'billingAddress':
        if (!value.trim()) error = "La dirección fiscal es obligatoria.";
        break;
      case 'shippingAddress':
        if (!value.trim()) error = "La dirección de envío es obligatoria.";
        break;
      case 'email':
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) error = "Debe ser un correo electrónico válido.";
        break;
      case 'amount':
        if (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) <= 0) {
          error = "Debe ser un monto positivo (ej: 150.50).";
        }
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error;
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  }, [validateField]);

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = {};
    for (const field in formData) {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }
    setFormErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  return { formData, formErrors, handleInputChange, validateForm };
}

export default function ChequeoPage() {
  const router = useRouter();
  const { formData, formErrors, handleInputChange, validateForm } = usePersonalDataForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (validateForm()) {
      localStorage.setItem('personalData', JSON.stringify(formData));
      router.push('/payment');
    } else {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Datos Personales</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Ingresa tus Datos Personales
            </h1>
          </div>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <InputField label="Nombre Completo" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Juan Pérez" error={formErrors.fullName} icon={<UserIcon />} />
              <InputField label="Teléfono (sin 58)" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="4141234567" error={formErrors.phoneNumber} icon={<PhoneIcon />} />
              <InputField label="Cédula o RIF" name="idNumber" value={formData.idNumber} onChange={handleInputChange} placeholder="V-12345678" error={formErrors.idNumber} icon={<IdentificationIcon />} />
              <InputField label="Dirección Fiscal" name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} placeholder="Av. Principal, Edif. X" error={formErrors.billingAddress} icon={<MapPinIcon />} />
              <InputField label="Dirección de Envío" name="shippingAddress" value={formData.shippingAddress} onChange={handleInputChange} placeholder="Calle Y, Casa Z" error={formErrors.shippingAddress} icon={<MapPinIcon />} />
              <InputField label="Correo Electrónico" name="email" value={formData.email} onChange={handleInputChange} placeholder="correo@ejemplo.com" error={formErrors.email} icon={<EnvelopeIcon />} />
              <InputField label="Monto a Pagar (Bs.)" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="150.00" error={formErrors.amount} icon={<CurrencyDollarIcon />} />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? <Spinner /> : <UserIcon className="h-5 w-5" />}
                <span>{isLoading ? "Cargando..." : "Continuar al Pago"}</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
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