export interface ResponseContributorDetails {
    code: number;
    status: string;
    message: string;
    data: [
        {
            numeroRuc: string;
            razonSocial: string;
            estadoContribuyenteRuc: string;
            actividadEconomicaPrincipal: string;
            tipoContribuyente: string;
            regimen: string;
            categoria: null | string;
            obligadoLlevarContabilidad: string;
            informacionFechasContribuyente: {
                fechaInicioActividades: string;
                fechaCese: string;
                fechaReinicioActividades: string;
                fechaActualizacion: string;
                
            };
            representantesLegales: [
                {
                    nombre: string;
                    identificacion: string;
                }
            ];
            motivoCancelacionSuspension: null | string;
            contribuyenteFantasma: string;
            transaccionesInexistente: string;
        }
    ]
}