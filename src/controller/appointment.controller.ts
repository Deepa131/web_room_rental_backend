import { Request, Response } from 'express';
import { AppointmentModel } from '../models/appointment.model';
import AddRoom from '../models/add.room.model';
import { HttpError } from '../errors/http-error';

export class AppointmentController {
    async bookAppointment(req: Request, res: Response) {
        try {
            const {
                roomId,
                ownerId,
                renterId,
                renterName,
                renterEmail,
                renterPhone,
                appointmentDate,
                appointmentTime,
                message,
            } = req.body;

            if (!roomId || !ownerId || !renterId || !renterName || !renterEmail || !renterPhone || !appointmentDate || !appointmentTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields',
                });
            }

            // Check if renter already has an appointment for this room
            const existingAppointment = await AppointmentModel.findOne({
                roomId,
                renterId,
                status: { $in: ['pending', 'confirmed'] }, // Only check active appointments
            });

            if (existingAppointment) {
                return res.status(409).json({
                    success: false,
                    message: 'You already have an appointment for this room. Please cancel or wait for the existing appointment to complete.',
                });
            }

            const appointment = new AppointmentModel({
                roomId,
                ownerId,
                renterId,
                renterName,
                renterEmail,
                renterPhone,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                message: message || '',
                status: 'pending',
            });

            await appointment.save();

            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully',
                data: appointment,
            });
        } catch (error: any) {
            console.error('Error booking appointment:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to book appointment',
            });
        }
    }

    async getOwnerAppointments(req: Request, res: Response) {
        try {
            const { ownerId } = req.params;
            const { status } = req.query;

            const filter: any = { ownerId };
            if (status) {
                filter.status = status;
            }

            const appointments = await AppointmentModel.find(filter).sort({ appointmentDate: -1 });

            // Fetch room details for each appointment
            const appointmentsWithRooms = await Promise.all(
                appointments.map(async (appointment) => {
                    const room = await AddRoom.findById(appointment.roomId).populate('roomType');
                    return {
                        ...appointment.toJSON(),
                        room: room ? {
                            id: room._id,
                            roomTitle: room.roomTitle,
                            location: room.location,
                            monthlyPrice: room.monthlyPrice,
                            images: room.images,
                            roomType: room.roomType,
                        } : null,
                    };
                })
            );

            res.status(200).json({
                success: true,
                data: appointmentsWithRooms,
            });
        } catch (error: any) {
            console.error('Error fetching owner appointments:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch appointments',
            });
        }
    }

    async getRenterAppointments(req: Request, res: Response) {
        try {
            const { renterId } = req.params;
            const { status } = req.query;

            const filter: any = { renterId };
            if (status) {
                filter.status = status;
            }

            const appointments = await AppointmentModel.find(filter).sort({ appointmentDate: -1 });

            // Fetch room details for each appointment
            const appointmentsWithRooms = await Promise.all(
                appointments.map(async (appointment) => {
                    const room = await AddRoom.findById(appointment.roomId).populate('roomType');
                    return {
                        ...appointment.toJSON(),
                        room: room ? {
                            id: room._id,
                            roomTitle: room.roomTitle,
                            location: room.location,
                            monthlyPrice: room.monthlyPrice,
                            images: room.images,
                            roomType: room.roomType,
                        } : null,
                    };
                })
            );

            res.status(200).json({
                success: true,
                data: appointmentsWithRooms,
            });
        } catch (error: any) {
            console.error('Error fetching renter appointments:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch appointments',
            });
        }
    }

    async getAppointmentById(req: Request, res: Response) {
        try {
            const { appointmentId } = req.params;

            const appointment = await AppointmentModel.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found',
                });
            }

            res.status(200).json({
                success: true,
                data: appointment,
            });
        } catch (error: any) {
            console.error('Error fetching appointment:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch appointment',
            });
        }
    }

    async updateAppointmentStatus(req: Request, res: Response) {
        try {
            const { appointmentId } = req.params;
            const { status } = req.body;

            if (!['pending', 'confirmed', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                });
            }

            const appointment = await AppointmentModel.findByIdAndUpdate(
                appointmentId,
                { status },
                { new: true }
            );

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Appointment status updated',
                data: appointment,
            });
        } catch (error: any) {
            console.error('Error updating appointment status:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update appointment',
            });
        }
    }

    async cancelAppointment(req: Request, res: Response) {
        try {
            const { appointmentId } = req.params;

            const appointment = await AppointmentModel.findByIdAndDelete(appointmentId);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Appointment deleted successfully',
            });
        } catch (error: any) {
            console.error('Error deleting appointment:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete appointment',
            });
        }
    }

    async updateAppointment(req: Request, res: Response) {
        try {
            const { appointmentId } = req.params;
            const {
                appointmentDate,
                appointmentTime,
                message,
            } = req.body;

            if (!appointmentDate || !appointmentTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment date and time are required',
                });
            }

            const appointment = await AppointmentModel.findByIdAndUpdate(
                appointmentId,
                {
                    appointmentDate: new Date(appointmentDate),
                    appointmentTime,
                    message: message || '',
                },
                { new: true }
            );

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Appointment updated successfully',
                data: appointment,
            });
        } catch (error: any) {
            console.error('Error updating appointment:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update appointment',
            });
        }
    }
}
