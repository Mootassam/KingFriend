import { Redirect, Route, Switch } from "react-router-dom";
import LayoutPage from "src/view/layout/LayoutPage";
import ScrollToTop from "src/view/layout/ScrollToTop";
import lazyRouter from "src/view/shared/Lazyroutes";
import routes from "src/view/shared/routes";

function RoutesComponent() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {routes.publicRoutes.map((route) => (
          <Route exact key={route.path} path={route.path} component={lazyRouter({ loader: route.loader })} />
        ))}

        <Route path="/app">
          <LayoutPage>
            <Switch>
              {routes.navRoutes.map((route) => (
                <Route exact key={route.path} path={route.path} component={lazyRouter({ loader: route.loader })} />
              ))}
              <Redirect to="/app" />
            </Switch>
          </LayoutPage>
        </Route>

        <Redirect to="/" />
      </Switch>
    </>
  );
}

export default RoutesComponent;
