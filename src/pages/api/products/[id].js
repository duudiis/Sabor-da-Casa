import nextConnect from "next-connect";

import authentication from "@/middlewares/authentication";

import Product from "@/models/Product";
import { Role } from "@/models/User";

import * as productsDb from "@/database/managers/products";

import { validateProductData } from "@/utils/validation/api/products";

const handler = nextConnect({
    onError: (error, req, res, next) => {
        console.error(error.stack);
        res.status(500).json({ status: 500, message: "Erro interno.", code: "INTERNAL_SERVER_ERROR" });
    },
    onNoMatch: (req, res) => {
        res.status(404).json({ status: 404, message: "Não encontrado.", code: "NOT_FOUND" });
    }
});

handler.get(async (req, res) => {

    const id = req.query?.id;

    const product = await productsDb.get(id);

    if (!product) {
        return res.status(404).json({ status: 404, message: "Produto não encontrado.", code: "UNKNOWN_PRODUCT" });
    };

    res.status(200).json({ status: 200, message: "OK", code: "OK", product });

});

handler.use(authentication);

handler.patch(async (req, res) => {

    if (req.user.role > Role.MANAGER) {
        return res.status(403).json({ status: 403, message: "Você não tem permissão para editar um produto.", code: "UNAUTHORIZED" });
    };

    const id = req.query?.id;

    const product = await productsDb.get(id);

    if (!product) {
        return res.status(404).json({ status: 404, message: "Produto não encontrado.", code: "UNKNOWN_PRODUCT" });
    };

    let newProduct = new Product(Object.assign({}, product, { ...req.body.product }));

    let errors = validateProductData(newProduct);
    
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: 400, message: "Erro de validação.", code: "VALIDATION_ERROR", errors });
    };

    let updated = await productsDb.update(newProduct);

    if (!updated) {
        return res.status(500).json({ status: 500, message: "Erro interno.", code: "INTERNAL_SERVER_ERROR" });
    };

    const updatedProduct = await productsDb.get(id);

    res.status(200).json({ status: 200, message: "OK", code: "OK", product: updatedProduct });

});

handler.delete(async (req, res) => {

    if (req.user.role > Role.MANAGER) {
        return res.status(403).json({ status: 403, message: "Você não tem permissão para excluir um produto.", code: "UNAUTHORIZED" });
    };

    const id = req.query?.id;

    const product = await productsDb.get(id);

    if (!product) {
        return res.status(404).json({ status: 404, message: "Produto não encontrado.", code: "UNKNOWN_PRODUCT" });
    };

    let deleted = await productsDb.deleteProduct(id);

    if (!deleted) {
        return res.status(404).json({ status: 500, message: "Erro interno.", code: "INTERNAL_SERVER_ERROR" });
    };

    res.status(200).json({ status: 200, message: "OK", code: "OK" });

});

export default handler;