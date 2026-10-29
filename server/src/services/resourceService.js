import { query } from '../config/db.js';
import { logAudit } from './auditService.js';

export async function getResources({
  search,
  category,
  type,
  minPrice,
  maxPrice,
  sort = 'newest',
  status = 'active',
  page = 1,
  limit = 12,
}) {
  let resources = await query('SELECT * FROM resources');

  // Filter by status (public sees active only, unless overridden by admin)
  if (status && status !== 'all') {
    resources = resources.filter(r => r.status === status);
  }

  // Filter by search query (title, description, location)
  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    resources = resources.filter(r =>
      r.title.toLowerCase().includes(s) ||
      r.description.toLowerCase().includes(s) ||
      r.location.toLowerCase().includes(s) ||
      r.category.toLowerCase().includes(s)
    );
  }

  // Filter by category
  if (category && category !== 'all' && category !== 'All Categories') {
    resources = resources.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by type (equipment | space)
  if (type && type !== 'all') {
    resources = resources.filter(r => r.type === type);
  }

  // Filter by price range
  if (minPrice !== undefined && minPrice !== '') {
    const min = parseFloat(minPrice);
    resources = resources.filter(r => Number(r.fee_per_hour) >= min);
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    const max = parseFloat(maxPrice);
    resources = resources.filter(r => Number(r.fee_per_hour) <= max);
  }

  // Sorting
  if (sort === 'price-low') {
    resources.sort((a, b) => Number(a.fee_per_hour) - Number(b.fee_per_hour));
  } else if (sort === 'price-high') {
    resources.sort((a, b) => Number(b.fee_per_hour) - Number(a.fee_per_hour));
  } else if (sort === 'capacity') {
    resources.sort((a, b) => Number(b.capacity) - Number(a.capacity));
  } else {
    // Newest first
    resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const total = resources.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;
  const paginated = resources.slice(offset, offset + limitNum);

  return {
    resources: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

export async function getResourceById(id) {
  const rows = await query('SELECT * FROM resources WHERE id = ?', [id]);
  const resource = rows[0];

  if (!resource) {
    const error = new Error('Resource not found.');
    error.statusCode = 404;
    throw error;
  }

  return resource;
}

export async function createResource(ownerId, resourceData, ipAddress) {
  const result = await query(
    `INSERT INTO resources (
      owner_id, title, category, type, description, location,
      capacity, fee_per_hour, min_duration_hours, max_duration_hours,
      requires_approval, requires_training, safety_instructions, booking_rules, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [
      ownerId,
      resourceData.title,
      resourceData.category,
      resourceData.type,
      resourceData.description,
      resourceData.location,
      resourceData.capacity || 1,
      resourceData.fee_per_hour || 0,
      resourceData.min_duration_hours || 1,
      resourceData.max_duration_hours || 8,
      resourceData.requires_approval ? 1 : 0,
      resourceData.requires_training ? 1 : 0,
      resourceData.safety_instructions || null,
      resourceData.booking_rules || null,
    ]
  );

  const resourceId = result.insertId;

  // Insert image if provided
  if (resourceData.image_url) {
    await query(
      `INSERT INTO resource_images (resource_id, image_url, is_primary) VALUES (?, ?, 1)`,
      [resourceId, resourceData.image_url]
    );
  }

  // Audit log
  await logAudit({
    userId: ownerId,
    action: 'RESOURCE_CREATED',
    entityType: 'RESOURCE',
    entityId: resourceId,
    details: { title: resourceData.title, category: resourceData.category },
    ipAddress,
  });

  return getResourceById(resourceId);
}

export async function updateResource(id, userId, userRole, updateData, ipAddress) {
  const resource = await getResourceById(id);

  // Check ownership unless admin
  if (userRole !== 'admin' && resource.owner_id !== userId) {
    const error = new Error('You do not have permission to modify this resource.');
    error.statusCode = 403;
    throw error;
  }

  await query(
    `UPDATE resources SET
      title = COALESCE(?, title),
      category = COALESCE(?, category),
      type = COALESCE(?, type),
      description = COALESCE(?, description),
      location = COALESCE(?, location),
      capacity = COALESCE(?, capacity),
      fee_per_hour = COALESCE(?, fee_per_hour),
      min_duration_hours = COALESCE(?, min_duration_hours),
      max_duration_hours = COALESCE(?, max_duration_hours),
      requires_approval = COALESCE(?, requires_approval),
      requires_training = COALESCE(?, requires_training),
      safety_instructions = COALESCE(?, safety_instructions),
      booking_rules = COALESCE(?, booking_rules),
      status = COALESCE(?, status)
    WHERE id = ?`,
    [
      updateData.title,
      updateData.category,
      updateData.type,
      updateData.description,
      updateData.location,
      updateData.capacity,
      updateData.fee_per_hour,
      updateData.min_duration_hours,
      updateData.max_duration_hours,
      updateData.requires_approval !== undefined ? (updateData.requires_approval ? 1 : 0) : null,
      updateData.requires_training !== undefined ? (updateData.requires_training ? 1 : 0) : null,
      updateData.safety_instructions,
      updateData.booking_rules,
      updateData.status,
      id
    ]
  );

  await logAudit({
    userId,
    action: 'RESOURCE_UPDATED',
    entityType: 'RESOURCE',
    entityId: id,
    details: updateData,
    ipAddress,
  });

  return getResourceById(id);
}

export async function deleteResource(id, userId, userRole, ipAddress) {
  const resource = await getResourceById(id);

  if (userRole !== 'admin' && resource.owner_id !== userId) {
    const error = new Error('You do not have permission to remove this resource.');
    error.statusCode = 403;
    throw error;
  }

  // Soft delete / deactivate
  await query('UPDATE resources SET status = ? WHERE id = ?', ['inactive', id]);

  await logAudit({
    userId,
    action: 'RESOURCE_DEACTIVATED',
    entityType: 'RESOURCE',
    entityId: id,
    details: { title: resource.title },
    ipAddress,
  });

  return { success: true, message: 'Resource deactivated successfully.' };
}

export async function getOwnerResources(ownerId) {
  const allResources = await query('SELECT * FROM resources');
  const ownerResources = allResources.filter(r => r.owner_id === ownerId);

  // Attach booking count summary
  const allBookings = await query('SELECT * FROM bookings');
  return ownerResources.map(r => {
    const resourceBookings = allBookings.filter(b => b.resource_id === r.id);
    return {
      ...r,
      total_bookings: resourceBookings.length,
      pending_requests: resourceBookings.filter(b => b.status === 'pending').length,
      active_bookings: resourceBookings.filter(b => b.status === 'approved' || b.status === 'checked_in').length,
    };
  });
}

export async function getPlatformStats() {
  const resources = await query('SELECT * FROM resources');
  const users = await query('SELECT * FROM users');
  const bookings = await query('SELECT * FROM bookings');

  return {
    total_resources: resources.filter(r => r.status === 'active').length,
    total_users: users.length,
    total_bookings: bookings.length,
    active_bookings: bookings.filter(b => b.status === 'approved' || b.status === 'checked_in').length,
    completed_bookings: bookings.filter(b => b.status === 'completed').length,
    pending_approvals: bookings.filter(b => b.status === 'pending').length,
  };
}
