import * as resourceService from '../services/resourceService.js';

export async function getResources(req, res, next) {
  try {
    const data = await resourceService.getResources(req.query);
    res.json({
      success: true,
      data: data.resources,
      pagination: data.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getResourceById(req, res, next) {
  try {
    const resource = await resourceService.getResourceById(req.params.id);
    res.json({
      success: true,
      data: resource,
    });
  } catch (err) {
    next(err);
  }
}

export async function createResource(req, res, next) {
  try {
    const resource = await resourceService.createResource(req.user.id, req.body, req.ip);
    res.status(201).json({
      success: true,
      message: 'Resource published successfully.',
      data: resource,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateResource(req, res, next) {
  try {
    const resource = await resourceService.updateResource(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body,
      req.ip
    );
    res.json({
      success: true,
      message: 'Resource updated successfully.',
      data: resource,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteResource(req, res, next) {
  try {
    const result = await resourceService.deleteResource(
      req.params.id,
      req.user.id,
      req.user.role,
      req.ip
    );
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOwnerResources(req, res, next) {
  try {
    const resources = await resourceService.getOwnerResources(req.user.id);
    res.json({
      success: true,
      data: resources,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlatformStats(req, res, next) {
  try {
    const stats = await resourceService.getPlatformStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}
