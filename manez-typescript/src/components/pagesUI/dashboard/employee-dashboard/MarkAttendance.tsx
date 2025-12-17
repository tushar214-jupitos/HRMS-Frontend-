"use client"
import CustomDropdown from '@/components/dropdown/CustomDropdown';
import { dropdownItems } from '@/data/dropdown-data';
import React, { useState } from 'react';
import { checkIn, checkOut } from '@/services/attendanceService';
import { toast } from 'sonner';

const MarkAttendance = () => {
    const [isLoading, setIsLoading] = useState({ checkIn: false, checkOut: false });

    const handleCheckIn = async () => {
        setIsLoading(prev => ({ ...prev, checkIn: true }));
        try {
            const response = await checkIn();
            console.log('Check-in response:', response);
            toast.success('Checked in successfully!');
        } catch (error: any) {
            console.error('Check-in error:', error);
            toast.error(error.message || 'Failed to check in. Please try again.');
        } finally {
            setIsLoading(prev => ({ ...prev, checkIn: false }));
        }
    };

    const handleCheckOut = async () => {
        setIsLoading(prev => ({ ...prev, checkOut: true }));
        try {
            const response = await checkOut();
            console.log('Check-out response:', response);
            toast.success('Checked out successfully!');
        } catch (error: any) {
            console.error('Check-out error:', error);
            toast.error(error.message || 'Failed to check out. Please try again.');
        } finally {
            setIsLoading(prev => ({ ...prev, checkOut: false }));
        }
    };

    return (
        <>
            <div className="card__wrapper no-height">
                <div className="card__title-wrap flex items-center justify-between mb-[20px]">
                    <h5 className="card__heading-title">Mark Attendance</h5>
                    <CustomDropdown items={dropdownItems} />
                </div>
                <p className="text-muted">Office Time: 09:00AM to 06:00PM</p>
                <div className="flex items-center gap-[15px]">
                    <div className="">
                        <button 
                            type="button" 
                            onClick={handleCheckIn}
                            disabled={isLoading.checkIn}
                            className="btn btn-primary"
                            id="clock_in"
                        >
                            {isLoading.checkIn ? 'Checking In...' : 'Clock In'}
                        </button>
                    </div>
                    <div className="">
                        <button 
                            type="button" 
                            onClick={handleCheckOut}
                            disabled={isLoading.checkOut}
                            className="btn btn-danger"
                            id="clock_out"
                        >
                            {isLoading.checkOut ? 'Checking Out...' : 'Clock Out'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MarkAttendance;