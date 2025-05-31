import React from 'react';
import { useRouter } from 'next/router';

export default function MarketDetail() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <div>
            {/* Implementation will be added here */}
        </div>
    );
} 