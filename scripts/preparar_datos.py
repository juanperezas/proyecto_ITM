#!/usr/bin/env python3
"""
Convierte el Excel limpio de matriculados en un JSON agregado y liviano
para usarlo en el sitio web (data/resumen.json).

Uso:
    python preparar_datos.py Matriculados_20260731_jp_limpio.xlsx
"""
import sys
import json
import pandas as pd

ENTRADA = sys.argv[1] if len(sys.argv) > 1 else "Matriculados_20260731_jp_limpio.xlsx"
SALIDA = "../data/resumen.json"

# Sedes grandes que sí se muestran individualmente en el edificio;
# todo lo demás se agrupa en "Otras sedes".
SEDES_PRINCIPALES = [
    "FRATERNIDAD MEDELLÍN", "ROBLEDO", "VIRTUAL", "FLORESTA", "CASTILLA",
]

# Ícono/metáfora visual para cada área de conocimiento real del archivo
ICONOS_AREA = {
    "Ingeniería, Arquitectura, Urbanismo y afines": "engranaje",
    "Economía, Administración, Contaduría y afines": "grafico",
    "Bellas Artes": "paleta",
    "Matemáticas y Ciencias Naturales": "matraz",
    "Humanidades y Ciencias Religiosas": "libro",
    "Ciencias de la Educación": "birrete",
    "Ciencias Sociales, Derecho y Ciencias Políticas": "balanza",
}


def conteo(serie: pd.Series, top: int | None = None) -> list[dict]:
    vc = serie.value_counts()
    if top:
        vc = vc.head(top)
    return [{"nombre": str(k), "total": int(v)} for k, v in vc.items()]


def main():
    df = pd.read_excel(ENTRADA, sheet_name="Data")

    df["Sede Agrupada"] = df["Sede"].where(
        df["Sede"].isin(SEDES_PRINCIPALES), "Otras sedes"
    )

    resumen = {
        "total_matriculados": int(len(df)),
        "anio": int(df["Ano"].iloc[0]),
        "por_sede": conteo(df["Sede Agrupada"]),
        "por_facultad": conteo(df["Facultad"]),
        "por_area_conocimiento": [
            {**item, "icono": ICONOS_AREA.get(item["nombre"], "libro")}
            for item in conteo(df["Area Conocimiento"])
        ],
        "por_sexo": conteo(df["Sexo"]),
        "por_estrato": conteo(df["Id Estrato"].astype(str)),
        "por_modalidad": conteo(df["Modalidad"]),
        "por_tipo_programa": conteo(df["Tipo Programa"]),
        "top_ciudades_nacimiento": conteo(df["Ciudad Nacimiento"], top=10),
        "top_programas": conteo(df["Nombre Programa"], top=10),
        "sedes_por_facultad": (
            df.groupby(["Sede Agrupada", "Facultad"])
            .size()
            .reset_index(name="total")
            .to_dict(orient="records")
        ),
        "programas_por_area": (
            df.groupby("Area Conocimiento")["Nombre Programa"]
            .apply(lambda s: conteo(s, top=6))
            .to_dict()
        ),
    }

    with open(SALIDA, "w", encoding="utf-8") as f:
        json.dump(resumen, f, ensure_ascii=False, indent=2)

    print(f"Generado {SALIDA}")
    print(f"Total matriculados: {resumen['total_matriculados']:,}")
    print(f"Sedes agrupadas: {[s['nombre'] for s in resumen['por_sede']]}")


if __name__ == "__main__":
    main()
