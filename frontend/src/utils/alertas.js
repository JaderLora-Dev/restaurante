import Swal from "sweetalert2";

//confirmar
export const confirmar = async ({
  titulo,
  texto,
  icono = "question",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}) => {
  return await Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d",
  });
};

//cargando
export const mostrarCarga = (titulo = "Cargando...") => {
  Swal.fire({
    title: titulo,
    text: "Espere un momento",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Exito
export const mostrarExito = (titulo, texto = "", tiempo = 1500) => {
  Swal.fire({
    icon: "success",
    title: titulo,
    text: texto,
    timer: tiempo,
    showCancelButton: false,
  });
};

//Error
export const mostrarError = (mensaje = "Ocurrió un error inesperado.") => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: mensaje,
  });
};

//cerrar alerta
export const cerrarAlerta = () => {
  Swal.close();
};
