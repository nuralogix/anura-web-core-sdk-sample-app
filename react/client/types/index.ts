export type SupportedLanguage = 'en' | 'ja' | 'zh' | 'es' | 'pt' | 'pt-BR' | 'it' | 'fr' | 'de';

export enum ErrorCodes {
    /** Camera access was denied */
    CAMERA_PERMISSION_DENIED = "CAMERA_PERMISSION_DENIED",
    /** DeepAffex Cloud processing error */
    WORKER_ERROR = "WORKER_ERROR",
    /** DeepAffex Cloud processing error */
    ANALYSIS_ERROR = "ANALYSIS_ERROR",
    /** No camera devices found */
    NO_DEVICES_FOUND = "NO_DEVICES_FOUND",
    /** Page is not visible */
    PAGE_NOT_VISIBLE = "PAGE_NOT_VISIBLE",
    /** Camera failed to start */
    CAMERA_START_FAILED = "CAMERA_START_FAILED",
    /** Measurement failed due to low signal-to-noise ratio */
    MEASUREMENT_LOW_SNR = "MEASUREMENT_LOW_SNR",
    /** Extraction library error */
    COLLECTOR = "COLLECTOR",
    /** Face not detected during measurement */
    FACE_NONE = "FACE_NONE",
    /** WebSocket disconnected */
    WEBSOCKET_DISCONNECTED = "WEBSOCKET_DISCONNECTED",
}
