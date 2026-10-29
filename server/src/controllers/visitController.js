import * as visitService from '../services/visitService.js';

export async function createVisit(req, res, next) {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const visit = await visitService.createVisitRequest(req.user.id, req.body, ipAddress);
    res.status(201).json({ success: true, message: 'Physical visit requested successfully.', data: visit });
  } catch (err) {
    next(err);
  }
}

export async function getMyVisits(req, res, next) {
  try {
    const visits = await visitService.getMyVisits(req.user.id);
    res.json({ success: true, count: visits.length, data: visits });
  } catch (err) {
    next(err);
  }
}

export async function getOwnerVisits(req, res, next) {
  try {
    const status = req.query.status || null;
    const visits = await visitService.getOwnerVisits(req.user.id, status);
    res.json({ success: true, count: visits.length, data: visits });
  } catch (err) {
    next(err);
  }
}

export async function getVisitById(req, res, next) {
  try {
    const visit = await visitService.getVisitById(req.params.id);
    res.json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
}

export async function approveVisit(req, res, next) {
  try {
    const visit = await visitService.approveVisit(req.params.id, req.user.id);
    res.json({ success: true, message: 'Visit approved.', data: visit });
  } catch (err) {
    next(err);
  }
}

export async function rejectVisit(req, res, next) {
  try {
    const visit = await visitService.rejectVisit(req.params.id, req.user.id, req.body.reason);
    res.json({ success: true, message: 'Visit declined.', data: visit });
  } catch (err) {
    next(err);
  }
}

export async function rescheduleVisit(req, res, next) {
  try {
    const visit = await visitService.rescheduleVisit(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Alternate visit time proposed.', data: visit });
  } catch (err) {
    next(err);
  }
}

export async function completeVisit(req, res, next) {
  try {
    const visit = await visitService.completeVisit(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Physical visit marked complete.', data: visit });
  } catch (err) {
    next(err);
  }
}

export async function recordDecision(req, res, next) {
  try {
    const visit = await visitService.recordVisitDecision(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Post-visit decision recorded.', data: visit });
  } catch (err) {
    next(err);
  }
}

