import { useState } from "react";
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  UserIcon,
  BuildingLibraryIcon,
  KeyIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

export default function PaymentButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" }); // 'success' or 'error'
  const [paymentUrl, setPaymentUrl] = useState("");
  const [showIframe, setShowIframe] = useState(false);
  const [c2pPhone, setC2pPhone] = useState("");
  const [c2pId, setC2pId] = useState("");
  const [c2pBank, setC2pBank] = useState("");
  const [destMobile, setDestMobile] = useState("");
  const [purchaseKey, setPurchaseKey] = useState("");
  const [amount, setAmount] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("c2p"); // 'card' o 'c2p'
  const [showKeyHelp, setShowKeyHelp] = useState(false);

  const handleCardPayment = async () => {
    setIsLoading(true);
    setStatus({ message: "", type: "" });
    setShowIframe(false);
    try {
      const res = await fetch(`/api/create-card-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear el pago con tarjeta.");
      }
      if (data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        setShowIframe(true);
      } else {
        throw new Error("No se recibió la URL de pago del servidor.");
      }
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleC2pPayment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: "", type: "" });
    setShowIframe(false); // Ocultar iframe si estaba visible
    try {
      const res = await fetch(`/api/create-c2p-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono: c2pPhone,
          ci: c2pId,
          banco: c2pBank,
          destino: destMobile,
          purchase_key: purchaseKey,
          amount: amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pago C2P.");
      }
      setStatus({ message: data.message || "Pago C2P iniciado con éxito.", type: "success" });
      // Limpiar formulario en caso de éxito
      setC2pPhone("");
      setC2pId("");
      setC2pBank("");
      setDestMobile("");
      setPurchaseKey("");
      setAmount("");

    } catch (err) {
      setStatus({ message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case 'c2pPhone':
      case 'destMobile':
        if (!/^58\d{10}$/.test(value)) {
          error = "Debe tener el formato 58XXXXXXXXXX.";
        }
        break;
      case 'c2pId':
        if (!/^[VEJGP]\d{7,9}$/i.test(value)) {
          error = "Formato de cédula inválido (Ej: V12345678).";
        }
        break;
      case 'c2pBank':
        if (!/^\d{4}$/.test(value)) {
          error = "Debe ser un código de 4 dígitos.";
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const setters = {
      c2pPhone: setC2pPhone,
      c2pId: setC2pId,
      c2pBank: setC2pBank,
      destMobile: setDestMobile,
      purchaseKey: setPurchaseKey,
      amount: setAmount,
    };
    setters[name](value);
    validateField(name, value);
  };
  
  const isFormInvalid = Object.values(formErrors).some(e => e) || !c2pPhone || !c2pId || !c2pBank || !destMobile || !purchaseKey || !amount;

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      {/* Pestañas */}
      <div className="flex border-b border-gray-200">
        <TabButton
          icon={<CreditCardIcon />}
          label="Tarjeta"
          isActive={activeTab === "card"}
          onClick={() => setActiveTab("card")}
        />
        <TabButton
          icon={<DevicePhoneMobileIcon />}
          label="Pago Móvil"
          isActive={activeTab === "c2p"}
          onClick={() => setActiveTab("c2p")}
        />
      </div>

      <div className="pt-6">
        {/* Alerta de Estado */}
        {status.message && (
          <div
            className={`p-4 mb-4 rounded-md text-center text-sm font-medium transition-all duration-300 ${
              status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Contenido de la Pestaña de Tarjeta */}
        {activeTab === "card" && (
          <div className="space-y-4 text-center">
            <p className="text-gray-600">Paga de forma segura con tu tarjeta de crédito o débito.</p>
            <button
              disabled={isLoading}
              onClick={handleCardPayment}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-lg shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner /> : <CreditCardIcon className="h-5 w-5" />}
              <span>{isLoading ? "Generando..." : "Pagar con Tarjeta"}</span>
            </button>
          </div>
        )}

        {/* Contenido de la Pestaña de Pago Móvil */}
        {activeTab === "c2p" && (
          <form onSubmit={handleC2pPayment} className="space-y-4">
            <InputField label="Monto a pagar (Bs.)" name="amount" value={amount} onChange={handleInputChange} placeholder="150.00" error={formErrors.amount} icon={<CurrencyDollarIcon />} />
            <InputField label="Teléfono origen" name="c2pPhone" value={c2pPhone} onChange={handleInputChange} placeholder="584142591177" error={formErrors.c2pPhone} icon={<DevicePhoneMobileIcon />} />
            <InputField label="Cédula destino" name="c2pId" value={c2pId} onChange={handleInputChange} placeholder="V18367443" error={formErrors.c2pId} icon={<UserIcon />} />
            <InputField label="Banco destino" name="c2pBank" value={c2pBank} onChange={handleInputChange} placeholder="0105" error={formErrors.c2pBank} icon={<BuildingLibraryIcon />} />
            <InputField label="Teléfono destino" name="destMobile" value={destMobile} onChange={handleInputChange} placeholder="584241513063" error={formErrors.destMobile} icon={<DevicePhoneMobileIcon />} />
            <div className="relative">
              <InputField 
                label="Clave de compra" 
                name="purchaseKey" 
                value={purchaseKey} 
                onChange={handleInputChange} 
                placeholder="••••" 
                error={formErrors.purchaseKey} 
                icon={<KeyIcon />} 
                type="password" 
                helpIcon={<QuestionMarkCircleIcon onClick={() => setShowKeyHelp(!showKeyHelp)} className="h-4 w-4 text-gray-400 hover:text-blue-600 cursor-pointer" />}
              />
              {showKeyHelp && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg">
                  Obtén tu <strong>Clave de Compra</strong> desde la app Mercantil o Amigo en Línea para autorizar esta transacción.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isFormInvalid}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner /> : <DevicePhoneMobileIcon className="h-5 w-5" />}
              <span>{isLoading ? "Procesando..." : "Realizar Pago Móvil"}</span>
            </button>
          </form>
        )}

        {/* Iframe */}
        {showIframe && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Completa tu pago</h3>
            <iframe
              src={paymentUrl}
              className="w-full h-96 border border-gray-300 rounded-lg shadow-inner"
              title="Pago Mercantil"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// --- Subcomponentes para una mejor estructura ---

const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium border-b-2 transition-colors duration-200 ease-in-out
      ${isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
  >
    <div className="h-5 w-5">{icon}</div>
    <span>{label}</span>
  </button>
);

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