export function buildFriendlyAlertMessage(detail, status) {
    if (status >= 500) {
        return 'El servidor presenta inconvenientes en este momento. Por favor, intenta de nuevo más tarde.';
    }
    if (!detail) {
        return 'Ocurrió un error al procesar tu solicitud.';
    }
    if (typeof detail === 'string') {
        return detail;
    }
    if (Array.isArray(detail)) {
        return detail
            .map((err) => (typeof err == 'string' ? err : err.msg || JSON.stringify(err)))
            .join(' | ');
    }
    return 'ocurrio un error al procesar tu solicitud.';
}


export async function apiRequest(endpoint, options = {}, onAlert = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    let response;
    try {
        response = await fetch(endpoint, {
            ...options,
            headers,
        });
    } catch {
        const friendlyMsg = 'Error de conexion con el servidor. verifica tu conexion a internet.';
        if (typeof onAlert === 'function') {
            onAlert({ type: 'error', message: friendlyMsg });
        }
        throw new Error(friendlyMsg);
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const friendlyMsg = buildFriendlyAlertMessage(data?.detail, response.status);
        if (typeof onAlert === 'function') {
            onAlert({ type: 'error', message: friendlyMsg });
        }
        const error = new Error(friendlyMsg);
        error.status = response.status;
        throw error;
    }
    return data;
}