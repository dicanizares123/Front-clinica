"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import Button from "../shared/Button";
import { useEffect } from "react";

type InvoiceItem = {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  hasVat: boolean;
};

type InvoiceFormData = {
  // Emisor (Hardcoded or loaded from config in real app)
  establishment: string; // 001
  emissionPoint: string; // 001
  sequential: string; // 000000001
  
  // Cliente
  customerName: string;
  customerIdType: "RUC" | "CEDULA" | "PASAPORTE";
  customerId: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;

  // Factura
  issueDate: string;
  
  // Items
  items: InvoiceItem[];
  
  // Pago
  paymentMethod: string;
};

const InvoiceForm = () => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      establishment: "001",
      emissionPoint: "001",
      sequential: "",
      customerIdType: "CEDULA",
      issueDate: new Date().toISOString().split('T')[0],
      items: [
        {
          code: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          hasVat: true,
        },
      ],
      paymentMethod: "SIN UTILIZACION DEL SISTEMA FINANCIERO",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const formValues = useWatch({ control });

  // Calculations
  const calculateTotals = (items: InvoiceItem[] = []) => {
    let subtotal15 = 0;
    let subtotal0 = 0;
    let totalDiscount = 0;

    items.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        const discount = Number(item.discount) || 0;
        
        const lineTotal = (qty * price) - discount;
        
        if (item.hasVat) {
            subtotal15 += lineTotal;
        } else {
            subtotal0 += lineTotal;
        }
        totalDiscount += discount;
    });

    const vat = subtotal15 * 0.15;
    const total = subtotal15 + subtotal0 + vat;

    return {
        subtotal15,
        subtotal0,
        totalDiscount,
        vat,
        total
    };
  };

  const totals = calculateTotals(formValues.items as InvoiceItem[]);

  const onSubmit = (data: InvoiceFormData) => {
    console.log("Invoice Data:", data);
    console.log("Calculated Totals:", totals);
    alert("Factura lista para procesar (Ver consola)");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Sección 1: Encabezado y Datos del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Información de Factura</h3>
             <div className="grid grid-cols-3 gap-2">
                <div>
                   <label className="block text-sm font-medium text-gray-700">Estab.</label>
                   <input
                        {...register("establishment")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        readOnly
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Pto. Emi.</label>
                   <input
                        {...register("emissionPoint")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        readOnly
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Secuencial</label>
                   <input
                        {...register("sequential", { required: "Requerido" })}
                        placeholder="Ej: 000000123"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                   />
                </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Fecha de Emisión</label>
               <input
                    type="date"
                    {...register("issueDate", { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
               />
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Datos del Cliente</h3>
            <div>
               <label className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
               <input
                    {...register("customerName", { required: "Requerido" })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
               />
               {errors.customerName && <span className="text-red-500 text-xs">Este campo es requerido</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo Identificación</label>
                    <select
                        {...register("customerIdType")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    >
                        <option value="CEDULA">Cédula</option>
                        <option value="RUC">RUC</option>
                        <option value="PASAPORTE">Pasaporte</option>
                    </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Identificación</label>
                   <input
                        {...register("customerId", { required: "Requerido" })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                   />
                </div>
            </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
               <input
                    type="email"
                    {...register("customerEmail", { required: "Requerido" })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
               />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700">Dirección</label>
                   <input
                        {...register("customerAddress")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                   />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                   <input
                        {...register("customerPhone")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                   />
                </div>
             </div>
        </div>
      </div>

      {/* Sección 2: Detalle de Productos/Servicios */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <h3 className="text-lg font-semibold text-gray-700">Detalle</h3>
             <button
                type="button"
                onClick={() => append({ code: "", description: "", quantity: 1, unitPrice: 0, discount: 0, hasVat: true })}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
             >
                + Agregar Item
             </button>
        </div>
        
        <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Descripción</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cant</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P. Unit</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desc.</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IVA?</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {fields.map((field, index) => {
                        // Watch specific field values for row calculation
                        const qty = formValues.items?.[index]?.quantity || 0;
                        const price = formValues.items?.[index]?.unitPrice || 0;
                        const disc = formValues.items?.[index]?.discount || 0;
                        const rowTotal = (qty * price) - disc;

                        return (
                            <tr key={field.id}>
                                <td className="px-3 py-2">
                                     <input {...register(`items.${index}.code`)} className="w-20 text-sm border-gray-300 rounded border p-1" />
                                </td>
                                <td className="px-3 py-2">
                                     <input {...register(`items.${index}.description` as const, { required: true })} className="w-full text-sm border-gray-300 rounded border p-1" />
                                </td>
                                <td className="px-3 py-2">
                                     <input type="number" step="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-16 text-sm border-gray-300 rounded border p-1" />
                                </td>
                                <td className="px-3 py-2">
                                     <input type="number" step="0.01" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} className="w-20 text-sm border-gray-300 rounded border p-1" />
                                </td>
                                <td className="px-3 py-2">
                                     <input type="number" step="0.01" {...register(`items.${index}.discount`, { valueAsNumber: true })} className="w-16 text-sm border-gray-300 rounded border p-1" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                     <input type="checkbox" {...register(`items.${index}.hasVat`)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700 font-medium">
                                     ${rowTotal.toFixed(2)}
                                </td>
                                <td className="px-3 py-2">
                                    <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-900">
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* Sección 3: Totales y Forma de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
         <div>
            <label className="block text-sm font-medium text-gray-700">Forma de Pago</label>
             <select
                {...register("paymentMethod")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            >
                <option value="SIN UTILIZACION DEL SISTEMA FINANCIERO">Sin Utilización del Sistema Financiero (Efectivo)</option>
                <option value="TARJETA DE CREDITO">Tarjeta de Crédito</option>
                <option value="TARJETA DE DEBITO">Tarjeta de Débito</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="OTRO">Otros con utilización del sistema financiero</option>
            </select>
            
            <div className="mt-4">
                 <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                 <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" rows={3}></textarea>
            </div>
         </div>

         <div className="space-y-2 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal 15%</span>
                <span className="font-medium">${totals.subtotal15.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal 0%</span>
                <span className="font-medium">${totals.subtotal0.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal No Objeto de IVA</span>
                <span className="font-medium">$0.00</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal Exento de IVA</span>
                <span className="font-medium">$0.00</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal sin Impuestos</span>
                <span className="font-medium">${(totals.subtotal15 + totals.subtotal0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Descuento</span>
                <span className="font-medium">${totals.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-300 pt-2">
                <span className="text-gray-800">IVA 15%</span>
                <span className="font-medium">${totals.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2">
                <span>IMPORTE TOTAL</span>
                <span>${totals.total.toFixed(2)}</span>
            </div>
         </div>
      </div>

       <div className="text-right">
       <Button 
            textButton="Guardar Factura" 
            onClick={handleSubmit(onSubmit)} 
            type="button" 
        />
      </div>
    </form>
  );
};

export default InvoiceForm;
