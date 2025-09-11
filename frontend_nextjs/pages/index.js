import Head from "next/head";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'; // Importar useEffect
import {
  UserIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ArrowRightIcon
} from "@heroicons/react/24/solid";

export default function CheckoutPage() {
  useEffect(() => {
    console.log("Cargando página de CHECKOUT...");
  }, []);

  const router = useRouter();
  const { origin } = router.query;
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    cedulaRif: '',
    direccionFiscal: '',
    direccionEnvio: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(formData).some(v => v.trim() === '')) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    localStorage.setItem('checkoutData', JSON.stringify(formData));
    router.push({
      pathname: '/payment',
      query: { origin },
    });
  };

  const isFormInvalid = Object.values(formData).some(v => v.trim() === '');

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Checkout - Datos del Cliente</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Datos del Cliente</h1>
            <p className="text-gray-500 text-sm mt-1">Complete su información para continuar.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Nombre Completo" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} placeholder="Ej: Ana María Pérez" icon={<UserIcon />} />
            <InputField label="Cédula o RIF" name="cedulaRif" value={formData.cedulaRif} onChange={handleInputChange} placeholder="V-12345678 o J-123456789" icon={<IdentificationIcon />} />
            <InputField label="Dirección Fiscal" name="direccionFiscal" value={formData.direccionFiscal} onChange={handleInputChange} placeholder="Ej: Av. Principal, Edif. ABC" icon={<BuildingOfficeIcon />} />
            <InputField label="Dirección de Envío" name="direccionEnvio" value={formData.direccionEnvio} onChange={handleInputChange} placeholder="Ej: Av. Secundaria, Casa #123" icon={<TruckIcon />} />
            
            <button
              type="submit"
              disabled={isFormInvalid}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span>Continuar al Pago</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

const InputField = ({ label, name, value, onChange, placeholder, icon }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <div className="h-5 w-5 text-gray-400">{icon}</div>
      </div>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
      />
    </div>
  </div>
);