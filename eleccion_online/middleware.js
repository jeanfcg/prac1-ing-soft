import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const jwt = request.cookies.get("MyTokenName");
  if (jwt === undefined) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  try {
    const { payload } = await jwtVerify(
        jwt.value,
        new TextEncoder().encode("secret")
    );
    console.log(payload);

    if (payload.userType === 1 && request.nextUrl.pathname === "/votacion") {
      // Usuario con userType 1 puede acceder a /votacion, pero no a /resultado
      return NextResponse.next();
    } else if (payload.userType === 2 && request.nextUrl.pathname === "/resultado") {
      // Usuario con userType 2 puede acceder a /resultado, pero no a /votacion
      return NextResponse.next();
    } else {
      // En cualquier otro caso, redireccionar a la página de inicio u otra página apropiada
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (err) {
    console.log(err);
    if (err.name === "JWTClaimValidationFailed" || err.name === "JWSTokenExpired") {
      // Redirigir solo si el error está relacionado con el token JWT inválido (expirado, inválido, etc.)
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // En caso de otros errores, continúa con la trayectoria normal
    return NextResponse.next();
  }
}

// Rutas protegidas
export const config = {
  matcher: ["/votacion", "/resultado"],
};
