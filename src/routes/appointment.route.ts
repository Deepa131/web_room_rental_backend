import express, { Router, Request, Response } from 'express';
import { AppointmentController } from '../controller/appointment.controller';
import { authorizedMiddleware } from '../middleware/auth.middleware';

const appointmentRouter = Router();
const appointmentController = new AppointmentController();

// Book appointment
appointmentRouter.post(
    '/book',
    authorizedMiddleware,
    (req: Request, res: Response) => appointmentController.bookAppointment(req, res)
);

// Get appointments for owner
appointmentRouter.get(
    '/owner/:ownerId',
    authorizedMiddleware,
    (req: Request, res: Response) => appointmentController.getOwnerAppointments(req, res)
);

// Get appointments for renter
appointmentRouter.get(
    '/renter/:renterId',
    authorizedMiddleware,
    (req: Request, res: Response) => appointmentController.getRenterAppointments(req, res)
);

// Get appointment by ID
appointmentRouter.get(
    '/:appointmentId',
    authorizedMiddleware,
    (req: Request, res: Response) => appointmentController.getAppointmentById(req, res)
);

// Update appointment status
appointmentRouter.put(
    '/:appointmentId/status',
    authorizedMiddleware,
    (req: Request, res: Response) => appointmentController.updateAppointmentStatus(req, res)
);

// Update appointment (date, time, message)
appointmentRouter.put(
    '/:appointmentId',
    authorizedMiddleware,
    (req: Request, res: Response) => appointmentController.updateAppointment(req, res)
);

// Cancel appointment
appointmentRouter.delete(
    '/:appointmentId',
    authorizedMiddleware,
    (req: Request, res: Response) => appointmentController.cancelAppointment(req, res)
);

export { appointmentRouter };
