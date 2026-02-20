import { Schema, model, Document } from 'mongoose';

export interface IAppointment extends Document {
    roomId: string;
    ownerId: string;
    renterId: string;
    renterName: string;
    renterEmail: string;
    renterPhone: string;
    appointmentDate: Date;
    appointmentTime: string;
    message?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
    {
        roomId: {
            type: String,
            required: true,
        },
        ownerId: {
            type: String,
            required: true,
        },
        renterId: {
            type: String,
            required: true,
        },
        renterName: {
            type: String,
            required: true,
        },
        renterEmail: {
            type: String,
            required: true,
        },
        renterPhone: {
            type: String,
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        appointmentTime: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

export const AppointmentModel = model<IAppointment>('Appointment', appointmentSchema);
