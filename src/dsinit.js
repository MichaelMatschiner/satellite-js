/*
 * satellite-js v1.4.0
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([
    './constants'
], function(
    constants
) {
    'use strict';

    return function(dsinitParameters) {
        /*-----------------------------------------------------------------------------
         *
         *                           procedure dsinit
         *
         *  this procedure provides deep space contributions to mean motion dot due
         *    to geopotential resonance with half day and one day orbits.
         *
         *  author        : david vallado                  719-573-2600   28 jun 2005
         *
         *  inputs        :
         *    cosim, sinim-
         *    emsq        - eccentricity squared
         *    argpo       - argument of perigee
         *    s1, s2, s3, s4, s5      -
         *    ss1, ss2, ss3, ss4, ss5 -
         *    sz1, sz3, sz11, sz13, sz21, sz23, sz31, sz33 -
         *    t           - time
         *    tc          -
         *    gsto        - greenwich sidereal time                   rad
         *    mo          - mean anomaly
         *    mdot        - mean anomaly dot (rate)
         *    no          - mean motion
         *    nodeo       - right ascension of ascending node
         *    nodedot     - right ascension of ascending node dot (rate)
         *    xpidot      -
         *    z1, z3, z11, z13, z21, z23, z31, z33 -
         *    eccm        - eccentricity
         *    argpm       - argument of perigee
         *    inclm       - inclination
         *    mm          - mean anomaly
         *    xn          - mean motion
         *    nodem       - right ascension of ascending node
         *
         *  outputs       :
         *    em          - eccentricity
         *    argpm       - argument of perigee
         *    inclm       - inclination
         *    mm          - mean anomaly
         *    nm          - mean motion
         *    nodem       - right ascension of ascending node
         *    irez        - flag for resonance           0-none, 1-one day, 2-half day
         *    atime       -
         *    d2201, d2211, d3210, d3222, d4410, d4422, d5220, d5232, d5421, d5433    -
         *    dedt        -
         *    didt        -
         *    dmdt        -
         *    dndt        -
         *    dnodt       -
         *    domdt       -
         *    del1, del2, del3        -
         *    ses  , sghl , sghs , sgs  , shl  , shs  , sis  , sls
         *    theta       -
         *    xfact       -
         *    xlamo       -
         *    xli         -
         *    xni
         *
         *  locals        :
         *    ainv2       -
         *    aonv        -
         *    cosisq      -
         *    eoc         -
         *    f220, f221, f311, f321, f322, f330, f441, f442, f522, f523, f542, f543  -
         *    g200, g201, g211, g300, g310, g322, g410, g422, g520, g521, g532, g533  -
         *    sini2       -
         *    temp        -
         *    temp1       -
         *    theta       -
         *    xno2        -
         *
         *  coupling      :
         *    getgravconst
         *
         *  references    :
         *    hoots, roehrich, norad spacetrack report #3 1980
         *    hoots, norad spacetrack report #6 1986
         *    hoots, schumacher and glover 2004
         *    vallado, crawford, hujsak, kelso  2006
         ----------------------------------------------------------------------------*/

        var cosim   = dsinitParameters.cosim,
            emsq    = dsinitParameters.emsq,
            argpo   = dsinitParameters.argpo,

            s1      = dsinitParameters.s1,
            s2      = dsinitParameters.s2,
            s3      = dsinitParameters.s3,
            s4      = dsinitParameters.s4,
            s5      = dsinitParameters.s5,
            sinim   = dsinitParameters.sinim,

            ss1     = dsinitParameters.ss1,
            ss2     = dsinitParameters.ss2,
            ss3     = dsinitParameters.ss3,
            ss4     = dsinitParameters.ss4,
            ss5     = dsinitParameters.ss5,

            sz1     = dsinitParameters.sz1,
            sz3     = dsinitParameters.sz3,
            sz11    = dsinitParameters.sz11,
            sz13    = dsinitParameters.sz13,
            sz21    = dsinitParameters.sz21,
            sz23    = dsinitParameters.sz23,
            sz31    = dsinitParameters.sz31,
            sz33    = dsinitParameters.sz33,

            t       = dsinitParameters.t,
            tc      = dsinitParameters.tc,
            gsto    = dsinitParameters.gsto,

            mo      = dsinitParameters.mo,
            mdot    = dsinitParameters.mdot,
            no      = dsinitParameters.no,
            nodeo   = dsinitParameters.nodeo,
            nodedot = dsinitParameters.nodedot,

            xpidot  = dsinitParameters.xpidot,

            z1      = dsinitParameters.z1,
            z3      = dsinitParameters.z3,
            z11     = dsinitParameters.z11,
            z13     = dsinitParameters.z13,
            z21     = dsinitParameters.z21,
            z23     = dsinitParameters.z23,
            z31     = dsinitParameters.z31,
            z33     = dsinitParameters.z33,

            ecco    = dsinitParameters.ecco,
            eccsq   = dsinitParameters.eccsq,
            em      = dsinitParameters.em,

            argpm   = dsinitParameters.argpm,
            inclm   = dsinitParameters.inclm,
            mm      = dsinitParameters.mm,
            nm      = dsinitParameters.nm,
            nodem   = dsinitParameters.nodem,
            irez    = dsinitParameters.irez,
            atime   = dsinitParameters.atime,

            d2201   = dsinitParameters.d2201,
            d2211   = dsinitParameters.d2211,
            d3210   = dsinitParameters.d3210,
            d3222   = dsinitParameters.d3222,
            d4410   = dsinitParameters.d4410,
            d4422   = dsinitParameters.d4422,

            d5220   = dsinitParameters.d5220,
            d5232   = dsinitParameters.d5232,
            d5421   = dsinitParameters.d5421,
            d5433   = dsinitParameters.d5433,

            dedt    = dsinitParameters.dedt,
            didt    = dsinitParameters.didt,
            dmdt    = dsinitParameters.dmdt,
            dnodt   = dsinitParameters.dnodt,
            domdt   = dsinitParameters.domdt,

            del1    = dsinitParameters.del1,
            del2    = dsinitParameters.del2,
            del3    = dsinitParameters.del3,

            xfact   = dsinitParameters.xfact,
            xlamo   = dsinitParameters.xlamo,
            xli     = dsinitParameters.xli,
            xni     = dsinitParameters.xni;

        var f220, f221, f311, f321, f322, f330, f441, f442, f522, f523, f542, f543;
        var g200, g201, g211, g300, g310, g322, g410, g422, g520, g521, g532, g533;
        var sini2,  temp,   temp1,    theta,    xno2,
            ainv2,  aonv,   cosisq, eoc;

        var q22     = 1.7891679e-6;
        var q31     = 2.1460748e-6;
        var q33     = 2.2123015e-7;
        var root22  = 1.7891679e-6;
        var root44  = 7.3636953e-9;
        var root54  = 2.1765803e-9;
        var rptim   = 4.37526908801129966e-3; // equates to 7.29211514668855e-5 rad/sec
        var root32  = 3.7393792e-7;
        var root52  = 1.1428639e-7;
        var x2o3    = 2.0 / 3.0;
        var znl     = 1.5835218e-4;
        var zns     = 1.19459e-5;


        //  -------------------- deep space initialization ------------
        irez    = 0;
        if (0.0034906585 < nm < 0.0052359877){
            irez = 1;
        }
        if (8.26e-3 <= nm <= 9.24e-3 && em >= 0.5){
            irez = 2;
        }

        //  ------------------------ do solar terms -------------------
        var ses =  ss1 * zns *  ss5;
        var sis =  ss2 * zns * (sz11 + sz13);
        var sls = -zns * ss3 * (sz1  + sz3  - 14.0 - 6.0 * emsq);
        var sghs=  ss4 * zns * (sz31 + sz33 -  6.0);
        var shs = -zns * ss2 * (sz21 + sz23);

        //  sgp4fix for 180 deg incl
        if (inclm < 5.2359877e-2 || inclm > constants.pi - 5.2359877e-2){
            shs = 0.0;
        }
        if (sinim !== 0.0){
            shs = shs / sinim;
        }
        var sgs  = sghs - cosim * shs;

        //  ------------------------- do lunar terms ------------------
        dedt =  ses + s1  *  znl *  s5;
        didt =  sis + s2  *  znl * (z11 + z13);
        dmdt =  sls - znl *  s3  * (z1  + z3 - 14.0 - 6.0 * emsq);
        var sghl =  s4  * znl * (z31 +  z33 - 6.0);
        var shll = -znl * s2  * (z21 +  z23);
        //  sgp4fix for 180 deg incl
        if ((inclm < 5.2359877e-2) || (inclm > (constants.pi - 5.2359877e-2))){
            shll = 0.0;
        }
        domdt = sgs + sghl;
        dnodt = shs;
        if (sinim !== 0.0){
            domdt = domdt - cosim / sinim * shll;
            dnodt = dnodt + shll / sinim;
        }


        //  ----------- calculate deep space resonance effects --------
        var dndt    = 0.0;
        theta   = (gsto + tc * rptim) % constants.twoPi;
        em          = em + dedt * t;
        inclm       = inclm + didt * t;
        argpm       = argpm + domdt * t;
        nodem       = nodem + dnodt * t;
        mm          = mm + dmdt * t;

        //   sgp4fix for negative inclinations
        //   the following if statement should be commented out
        //if (inclm < 0.0)
        //  {
        //    inclm  = -inclm;
        //    argpm  = argpm - pi;
        //    nodem = nodem + pi;
        //  }


        //  -------------- initialize the resonance terms -------------
        if (irez !== 0) {
            aonv = Math.pow(nm / constants.xke, x2o3);
            //  ---------- geopotential resonance for 12 hour orbits ------
            if (irez === 2) {
                cosisq = cosim * cosim;
                var emo= em;
                em     = ecco;
                var emsqo  = emsq;
                emsq   = eccsq;
                eoc    = em * emsq;
                g201   = -0.306 - (em - 0.64) * 0.440;

                if (em <= 0.65){
                    g211 =    3.616  -  13.2470 * em +  16.2900 * emsq;
                    g310 =  -19.302  + 117.3900 * em - 228.4190 * emsq +  156.5910 * eoc;
                    g322 =  -18.9068 + 109.7927 * em - 214.6334 * emsq +  146.5816 * eoc;
                    g410 =  -41.122  + 242.6940 * em - 471.0940 * emsq +  313.9530 * eoc;
                    g422 = -146.407  + 841.8800 * em - 1629.014 * emsq + 1083.4350 * eoc;
                    g520 = -532.114  + 3017.977 * em - 5740.032 * emsq + 3708.2760 * eoc;
                }
                else {
                    g211 =   -72.099 +   331.819 * em -   508.738 * emsq +   266.724 * eoc;
                    g310 =  -346.844 +  1582.851 * em -  2415.925 * emsq +  1246.113 * eoc;
                    g322 =  -342.585 +  1554.908 * em -  2366.899 * emsq +  1215.972 * eoc;
                    g410 = -1052.797 +  4758.686 * em -  7193.992 * emsq +  3651.957 * eoc;
                    g422 = -3581.690 + 16178.110 * em - 24462.770 * emsq + 12422.520 * eoc;
                    if (em > 0.715) {
                        g520 =-5149.66 + 29936.92 * em - 54087.36 * emsq + 31324.56 * eoc;
                    }
                    else {
                        g520 = 1464.74 -  4664.75 * em +  3763.64 * emsq;
                    }
                }
                if (em < 0.7) {
                    g533 = -919.22770 + 4988.6100 * em - 9064.7700 * emsq + 5542.21  * eoc;
                    g521 = -822.71072 + 4568.6173 * em - 8491.4146 * emsq + 5337.524 * eoc;
                    g532 = -853.66600 + 4690.2500 * em - 8624.7700 * emsq + 5341.4  * eoc;
                }
                else{
                    g533 =-37995.780 + 161616.52 * em - 229838.20 * emsq + 109377.94 * eoc;
                    g521 =-51752.104 + 218913.95 * em - 309468.16 * emsq + 146349.42 * eoc;
                    g532 =-40023.880 + 170470.89 * em - 242699.48 * emsq + 115605.82 * eoc;
                }
                sini2 =  sinim * sinim;
                f220  =  0.75 * (1.0 + 2.0 * cosim+cosisq);
                f221  =  1.5 * sini2;
                f321  =  1.875 * sinim  *  (1.0 - 2.0 * cosim - 3.0 * cosisq);
                f322  = -1.875 * sinim  *  (1.0 + 2.0 * cosim - 3.0 * cosisq);
                f441  = 35.0 * sini2 * f220;
                f442  = 39.3750 * sini2 * sini2;
                f522  =  9.84375 * sinim * (sini2 * (1.0 - 2.0 * cosim- 5.0 * cosisq) +
                0.33333333 * (-2.0 + 4.0 * cosim + 6.0 * cosisq) );
                f523  = sinim * (4.92187512 * sini2 * (-2.0 - 4.0 * cosim +
                10.0 * cosisq) + 6.56250012 * (1.0+2.0 * cosim - 3.0 * cosisq));
                f542  = 29.53125 * sinim * (2.0 - 8.0 * cosim + cosisq *
                (-12.0    + 8.0   *  cosim + 10.0 * cosisq));
                f543  = 29.53125 * sinim * (-2.0 - 8.0   * cosim+cosisq *
                ( 12.0    + 8.0   * cosim - 10.0  * cosisq));

                xno2  =  nm     * nm;
                ainv2 =  aonv   * aonv;
                temp1 =  3.0    * xno2  * ainv2;
                temp  =  temp1  * root22;
                d2201 =  temp   * f220  * g201;
                d2211 =  temp   * f221  * g211;
                temp1 =  temp1  * aonv;
                temp  =  temp1  * root32;
                d3210 =  temp   * f321  * g310;
                d3222 =  temp   * f322  * g322;
                temp1 =  temp1  * aonv;
                temp  =  2.0    * temp1 * root44;
                d4410 =  temp   * f441  * g410;
                d4422 =  temp   * f442  * g422;
                temp1 =  temp1  * aonv;
                temp  =  temp1  * root52;
                d5220 =  temp   * f522  * g520;
                d5232 =  temp   * f523  * g532;
                temp  =  2.0    * temp1 * root54;
                d5421 =  temp   * f542  * g521;
                d5433 =  temp   * f543  * g533;
                xlamo = (mo     + nodeo + nodeo -  theta    - theta) % constants.twoPi;
                xfact =  mdot   + dmdt  + 2.0   * (nodedot  + dnodt  - rptim) - no;
                em    =  emo;
                emsq  =  emsqo;
            }
            //  ---------------- synchronous resonance terms --------------
            if (irez === 1) {
                g200  = 1.0 + emsq * (-2.5 + 0.8125 * emsq);
                g310  = 1.0 + 2.0 * emsq;
                g300  = 1.0 + emsq * (-6.0 + 6.60937 * emsq);
                f220  = 0.75 * (1.0 + cosim) * (1.0 + cosim);
                f311  = 0.9375 * sinim * sinim * (1.0 + 3.0 * cosim) - 0.75 * (1.0 + cosim);
                f330  = 1.0 + cosim;
                f330  = 1.875 * f330 * f330 * f330;
                del1  = 3.0 * nm * nm * aonv * aonv;
                del2  = 2.0 * del1 * f220 * g200 * q22;
                del3  = 3.0 * del1 * f330 * g300 * q33 * aonv;
                del1  = del1 * f311 * g310 * q31 * aonv;
                xlamo = (mo + nodeo + argpo - theta) % constants.twoPi;
                xfact = mdot + xpidot - rptim + dmdt + domdt + dnodt - no;
            }
            //  ------------ for sgp4, initialize the integrator ----------
            xli   = xlamo;
            xni   = no;
            atime = 0.0;
            nm    = no + dndt;
        }
        var dsinitResults = {
            em : em,
            argpm : argpm,
            inclm : inclm,
            mm : mm,
            nm : nm,
            nodem : nodem,

            irez : irez,
            atime : atime,

            d2201 : d2201,
            d2211 : d2211,
            d3210 : d3210,
            d3222 : d3222,
            d4410 : d4410,

            d4422 : d4422,
            d5220 : d5220,
            d5232 : d5232,
            d5421 : d5421,
            d5433 : d5433,

            dedt : dedt,
            didt : didt,
            dmdt : dmdt,
            dndt : dndt,
            dnodt : dnodt,
            domdt : domdt,

            del1 : del1,
            del2 : del2,
            del3 : del3,

            xfact : xfact,
            xlamo : xlamo,
            xli : xli,
            xni : xni
        };
        return dsinitResults;
    };
});