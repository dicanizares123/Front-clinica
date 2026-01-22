export default interface ResponseValidateEstablishment {
    code: number;
    status: string;
    message: string;
    data: [
        {
            nombreFantasiaComercial: string;
            tipoEstablecimiento: string;
            direccionCompleta: string;
            estado: string;
            numeroEstablecimiento: string;
            matriz: string;
        }
    ]
}