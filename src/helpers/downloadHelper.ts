// Download helper utility that completely avoids DOM manipulation
export const downloadFile = (content: string, fileName: string, mimeType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            // Use a completely different approach - create a blob URL and open it directly
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            
            // Use window.open directly without any DOM manipulation
            const newWindow = window.open(url, '_blank');
            
            if (newWindow) {
                // If window opened successfully, clean up after a delay
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    resolve();
                }, 1000);
            } else {
                // If popup was blocked, try a different approach
                console.warn('Popup blocked, trying alternative download method');
                
                // Create a data URL and try to open it
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (e.target && e.target.result) {
                        const dataUrl = e.target.result as string;
                        window.open(dataUrl, '_blank');
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                            resolve();
                        }, 1000);
                    } else {
                        window.URL.revokeObjectURL(url);
                        reject(new Error('Failed to create data URL'));
                    }
                };
                reader.onerror = function() {
                    window.URL.revokeObjectURL(url);
                    reject(new Error('Failed to read file'));
                };
                reader.readAsDataURL(blob);
            }
        } catch (error) {
            console.error('Download error:', error);
            reject(error);
        }
    });
};

// Alternative method using iframe (completely separate from React DOM)
export const downloadFileViaIframe = (content: string, fileName: string, mimeType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            
            // Create an iframe that's completely separate from React
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            
            // Use a completely different approach - append to a separate container
            let downloadContainer = document.getElementById('download-container');
            if (!downloadContainer) {
                downloadContainer = document.createElement('div');
                downloadContainer.id = 'download-container';
                downloadContainer.style.position = 'fixed';
                downloadContainer.style.left = '-9999px';
                downloadContainer.style.top = '-9999px';
                downloadContainer.style.zIndex = '-9999';
                downloadContainer.style.pointerEvents = 'none';
                document.body.appendChild(downloadContainer);
            }
            
            downloadContainer.appendChild(iframe);
            
            // Clean up after a delay
            setTimeout(() => {
                try {
                    if (downloadContainer && downloadContainer.contains(iframe)) {
                        downloadContainer.removeChild(iframe);
                    }
                } catch (cleanupError) {
                    console.warn('Cleanup error (non-critical):', cleanupError);
                }
                window.URL.revokeObjectURL(url);
                resolve();
            }, 2000);
            
        } catch (error) {
            console.error('Download error:', error);
            reject(error);
        }
    });
};

// Simple method that just opens the content in a new tab
export const openFileInNewTab = (content: string, fileName: string, mimeType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            
            // Simply open in new tab
            window.open(url, '_blank');
            
            // Clean up after a delay
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                resolve();
            }, 1000);
            
        } catch (error) {
            console.error('Download error:', error);
            reject(error);
        }
    });
}; 