import * as mesaService from "../services/mesas.service.js";

// mostrar mesas
export const mostrarMesas = async (req, res, next) => {
  try {
    const { buscar, estado, orden } = req.query;

    const mesas = await mesaService.obtenerMesas(buscar, estado, orden);

    res.status(200).json(mesas);
  } catch (error) {
    next(error);
  }
};

//mostrar por id
export const mostrarMesaId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const mesa = await mesaService.obtenerMesaId(id);

    res.status(200).json(mesa);
  } catch (error) {
    next(error);
  }
};

//crear mesas
export const agregarMesa = async (req, res, next) => {
  try {
    const mesaNueva = await mesaService.crearMesa(req.body);

    res.status(201).json({
      mensaje: "Mesa creada correctamente",
      mesa: mesaNueva,
    });
  } catch (error) {
    next(error);
  }
};

// actualizar mesa
export const editarMesa = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const mesaActualizada = await mesaService.actualizarMesa(id, req.body);

    res.status(200).json({
      mensaje: "Mesa actualizada correctamente",
      mesa: mesaActualizada,
    });
  } catch (error) {
    next(error);
  }
};

//cambiar estado
export const cambiarEstadoMesa = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    const mesa = await mesaService.cambiarEstadoMesa(
      id,
      estado,
      req.usuario.rol,
    );

    res.status(200).json({ mensaje: "Mesa actualizada correctamente", mesa });
  } catch (error) {
    next(error);
  }
};

// eliminar mesas
export const borrarMesa = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const rol = req.usuario.rol;

    const respuesta = await mesaService.eliminarMesa(id, rol);

    res.status(200).json({ mensaje: respuesta.mensaje });
  } catch (error) {
    next(error);
  }
};
