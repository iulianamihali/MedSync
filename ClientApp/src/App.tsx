import AppRouter from "./routes/AppRouter";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    return (
        <>
            <ToastContainer />
            <AppRouter />
        </>
    );
}