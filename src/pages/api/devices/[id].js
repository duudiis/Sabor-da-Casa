import nextConnect from "next-connect";

import authentication from "@/middlewares/authentication";

import { Role } from "@/models/User";

import * as usersDb from "@/database/managers/users";

const handler = nextConnect({
    onError: (error, req, res, next) => {
        console.error(error.stack);
        res.status(500).json({ status: 500, message: "Erro interno.", code: "INTERNAL_SERVER_ERROR" });
    },
    onNoMatch: (req, res) => {
        res.status(404).json({ status: 404, message: "Não encontrado.", code: "NOT_FOUND" });
    }
});

handler.use(authentication);

handler.get(async (req, res) => {

    if (req.user.role > Role.MANAGER) {
        return res.status(403).json({ status: 403, message: "Você não tem permissão para buscar um dispositivo.", code: "UNAUTHORIZED" });
    };

    const id = req.query.id;
    const device = req.wss.getDeviceSocket().get(id);

    if (!device) {
        return res.status(404).json({ status: 404, message: "Dispositivo não encontrado.", code: "NOT_FOUND" });
    };

    let deviceData = {
        id: device.id,
        name: device.name,
        userId: device.userId,
    };

    if (device.userId != null) {
        deviceData.user = await usersDb.getById(device.userId);
    } else {
        deviceData.user = null;
    };

    res.status(200).json({ status: 200, message: "OK", code: "OK", device: deviceData });

});

handler.patch(async (req, res) => {

    if (req.user.role > Role.MANAGER) {
        return res.status(403).json({ status: 403, message: "Você não tem permissão para alterar um dispositivo.", code: "UNAUTHORIZED" });
    };

    const id = req.query.id;
    const device = req.wss.getDeviceSocket().get(id);

    if (!device) {
        return res.status(404).json({ status: 404, message: "Dispositivo não encontrado.", code: "NOT_FOUND" });
    };

    let userId = req.body.userId || null;

    device.setUserId(userId);

    res.status(200).json({ status: 200, message: "OK", code: "OK" });

});

handler.delete(async (req, res) => {

    if (req.user.role > Role.MANAGER) {
        return res.status(403).json({ status: 403, message: "Você não tem permissão para desconectar um dispositivo.", code: "UNAUTHORIZED" });
    };

    const id = req.query.id;
    const device = req.wss.getDeviceSocket().get(id);

    if (!device) {
        return res.status(404).json({ status: 404, message: "Dispositivo não encontrado.", code: "NOT_FOUND" });
    };

    device.forceDisconnect();

    res.status(200).json({ status: 200, message: "OK", code: "OK" });

});

export default handler;