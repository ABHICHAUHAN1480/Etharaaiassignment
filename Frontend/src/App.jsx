import { Link, createBrowserRouter, RouterProvider, useRouteError } from "react-router-dom";
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <main className="app-shell grid place-items-center px-4 py-10">
      <section className="surface max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          !
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The page hit an error while rendering. Try returning to the dashboard.
        </p>
        {error?.message && (
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-left text-xs font-medium text-slate-500">
            {error.message}
          </p>
        )}
        <Link to="/" className="primary-button mt-6 w-full">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "/signup",
    element: <Signup />,
    errorElement: <ErrorPage />
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  )

}

export default App
